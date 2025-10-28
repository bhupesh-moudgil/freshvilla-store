const StoreUser = require('../models/StoreUser');
const Store = require('../models/Store');
const Admin = require('../models/Admin');
const crypto = require('crypto');

// Get all stores
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'email', 'phone', 'city', 'isActive', 'totalProducts', 'totalOrders', 'rating'],
    });

    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users for a specific store (Super Admin)
exports.getStoreUsers = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const users = await StoreUser.findAll({
      where: { storeId },
      attributes: { exclude: ['password'] },
      order: [['role', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
        },
        users: users.map(user => ({
          ...user.toJSON(),
          permissions: user.getPermissions(),
        })),
      },
    });
  } catch (error) {
    console.error('Get store users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create store owner (initial setup)
exports.createStoreOwner = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { email, firstName, lastName, phone, password } = req.body;

    // Verify store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Check if store already has an owner
    const existingOwner = await StoreUser.findOne({
      where: { storeId, role: 'owner' },
    });

    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: 'This store already has an owner',
      });
    }

    // Check if email already exists
    const existingUser = await StoreUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create owner
    const owner = await StoreUser.create({
      storeId,
      email,
      firstName,
      lastName,
      phone,
      password: password || crypto.randomBytes(8).toString('hex'),
      role: 'owner',
      status: 'active',
      invitedBy: req.admin.id,
    });

    // Update store ownerId
    await store.update({ ownerId: owner.id });

    const ownerResponse = owner.toJSON();
    delete ownerResponse.password;

    res.status(201).json({
      success: true,
      message: 'Store owner created successfully',
      data: {
        ...ownerResponse,
        permissions: owner.getPermissions(),
      },
    });
  } catch (error) {
    console.error('Create store owner error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Invite user to store (Super Admin)
exports.inviteUserToStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { email, firstName, lastName, phone, role, customPermissions } = req.body;

    // Verify store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Cannot create owner through this endpoint
    if (role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Use createStoreOwner endpoint to create store owners',
      });
    }

    // Check if email already exists
    const existingUser = await StoreUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Create user
    const user = await StoreUser.create({
      storeId,
      email,
      firstName,
      lastName,
      phone,
      role: role || 'agent',
      permissions: customPermissions || {},
      password: tempPassword,
      invitedBy: req.admin.id,
      status: 'active',
    });

    // TODO: Send invitation email
    // await sendInvitationEmail(email, firstName, tempPassword, store.name);

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User invited successfully',
      data: {
        ...userResponse,
        tempPassword, // Remove this when email is implemented
        permissions: user.getPermissions(),
        store: {
          id: store.id,
          name: store.name,
        },
      },
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update store user (Super Admin)
exports.updateStoreUser = async (req, res) => {
  try {
    const { storeId, userId } = req.params;
    const { firstName, lastName, phone, role, customPermissions, status } = req.body;

    const user = await StoreUser.findOne({ where: { id: userId, storeId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot modify owner role
    if (user.role === 'owner' && role && role !== 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role. Transfer ownership first.',
      });
    }

    // Update user
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      role: role || user.role,
      permissions: customPermissions !== undefined ? customPermissions : user.permissions,
      status: status || user.status,
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        ...userResponse,
        permissions: user.getPermissions(),
      },
    });
  } catch (error) {
    console.error('Update store user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete store user (Super Admin)
exports.deleteStoreUser = async (req, res) => {
  try {
    const { storeId, userId } = req.params;

    const user = await StoreUser.findOne({ where: { id: userId, storeId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot delete owner
    if (user.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete store owner. Transfer ownership first.',
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete store user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Transfer store ownership
exports.transferOwnership = async (req, res) => {
  try {
    const { storeId, userId } = req.params;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const newOwner = await StoreUser.findOne({ where: { id: userId, storeId } });
    if (!newOwner) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentOwner = await StoreUser.findOne({ where: { storeId, role: 'owner' } });

    // Demote current owner to admin
    if (currentOwner) {
      await currentOwner.update({ role: 'admin' });
    }

    // Promote new owner
    await newOwner.update({ role: 'owner' });

    // Update store
    await store.update({ ownerId: newOwner.id });

    res.json({
      success: true,
      message: 'Ownership transferred successfully',
      data: {
        previousOwner: currentOwner ? {
          id: currentOwner.id,
          name: `${currentOwner.firstName} ${currentOwner.lastName}`,
          newRole: 'admin',
        } : null,
        newOwner: {
          id: newOwner.id,
          name: `${newOwner.firstName} ${newOwner.lastName}`,
          role: 'owner',
        },
      },
    });
  } catch (error) {
    console.error('Transfer ownership error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard stats
exports.getStoreUserStats = async (req, res) => {
  try {
    const totalStores = await Store.count({ where: { isActive: true } });
    const totalUsers = await StoreUser.count({ where: { status: 'active' } });
    
    const usersByRole = await StoreUser.findAll({
      attributes: [
        'role',
        [StoreUser.sequelize.fn('COUNT', StoreUser.sequelize.col('id')), 'count'],
      ],
      where: { status: 'active' },
      group: ['role'],
      raw: true,
    });

    const usersByStore = await StoreUser.findAll({
      attributes: [
        'storeId',
        [StoreUser.sequelize.fn('COUNT', StoreUser.sequelize.col('id')), 'userCount'],
      ],
      include: [{
        model: Store,
        as: 'store',
        attributes: ['name'],
      }],
      where: { status: 'active' },
      group: ['storeId', 'store.id', 'store.name'],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalStores,
        totalUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = parseInt(item.count);
          return acc;
        }, {}),
        usersByStore,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
