require('dotenv').config();
const { connectDB } = require('../config/database');
const Settings = require('../models/Settings');

async function setupSmtpSettings() {
  try {
    console.log('🔧 Setting up SMTP configuration in database...\n');
    
    // Connect to database
    await connectDB();
    
    // Sync Settings table
    await Settings.sync({ alter: true });
    
    // Get SMTP credentials from environment or prompt
    const smtpHost = process.env.SMTP_HOST || 'smtp.mailgun.org';
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    
    if (!smtpUser || !smtpPassword) {
      console.error('❌ SMTP_USER and SMTP_PASSWORD must be set in environment variables');
      process.exit(1);
    }
    
    // Save SMTP settings to database
    await Settings.setByKey('smtp_host', smtpHost, false, 'SMTP server host', 'email');
    console.log('✅ Set smtp_host:', smtpHost);
    
    await Settings.setByKey('smtp_port', smtpPort, false, 'SMTP server port', 'email');
    console.log('✅ Set smtp_port:', smtpPort);
    
    await Settings.setByKey('smtp_user', smtpUser, false, 'SMTP username', 'email');
    console.log('✅ Set smtp_user:', smtpUser);
    
    await Settings.setByKey('smtp_password', smtpPassword, true, 'SMTP password (encrypted)', 'email');
    console.log('✅ Set smtp_password: ***ENCRYPTED***');
    
    await Settings.setByKey('smtp_from', smtpFrom, false, 'Default sender email', 'email');
    console.log('✅ Set smtp_from:', smtpFrom);
    
    console.log('\n✅ SMTP settings configured successfully!');
    console.log('   Settings are stored encrypted in the database.');
    console.log('   Restart the server to apply changes.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up SMTP settings:', error);
    process.exit(1);
  }
}

setupSmtpSettings();
