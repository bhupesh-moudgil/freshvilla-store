const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

// Encryption key from environment variable or generate one
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Setting key is required' }
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  encrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  description: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  }
}, {
  timestamps: true,
  tableName: 'settings',
  hooks: {
    beforeCreate: async (setting) => {
      if (setting.encrypted && setting.value) {
        setting.value = encrypt(setting.value);
      }
    },
    beforeUpdate: async (setting) => {
      if (setting.encrypted && setting.changed('value') && setting.value) {
        setting.value = encrypt(setting.value);
      }
    },
    afterFind: (results) => {
      if (!results) return;
      
      const decrypt = (setting) => {
        if (setting.encrypted && setting.value) {
          try {
            setting.value = decryptValue(setting.value);
          } catch (error) {
            console.error('Decryption error:', error);
          }
        }
      };

      if (Array.isArray(results)) {
        results.forEach(decrypt);
      } else {
        decrypt(results);
      }
    }
  }
});

// Encryption helper
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decryption helper
function decryptValue(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Helper method to get setting by key
Settings.getByKey = async function(key) {
  const setting = await this.findOne({ where: { key } });
  return setting ? setting.value : null;
};

// Helper method to set value
Settings.setByKey = async function(key, value, encrypted = false, description = '', category = 'general') {
  const [setting] = await this.findOrCreate({
    where: { key },
    defaults: { value, encrypted, description, category }
  });
  
  if (setting.value !== value) {
    setting.value = value;
    setting.encrypted = encrypted;
    await setting.save();
  }
  
  return setting;
};

module.exports = Settings;
