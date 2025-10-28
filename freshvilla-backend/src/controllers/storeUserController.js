const StoreUser = require('../models/StoreUser');
const Store = require('../models/Store');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get all users for a store
exports.getStoreUsers = async (req, res) => {
  try {
    const { storeId } = req.params;
    const currentUser = req.user;

    // Check permission
    if (!currentUser.can('users', 'view')) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view users' 
      });
    }

    const users = await StoreUser.findAll({
      where: { storeId },
      attributes: { exclude: ['password'] },
      include: [{
        model: StoreUser,
        as: 'inviter',
        attributes: ['firstName', 'lastName', 'email'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: users.map(user => ({
        ...user.toJSON(),
        permissions: user.getPermissions(),
      })),
    });
  } catch (error) {
    console.error('Get store users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Invite new user
exports.inviteUser = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { email, firstName, lastName, phone, role, customPermissions } = req.body;
    const currentUser = req.user;

    // Check permission
    if (!currentUser.can('users', 'create')) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to invite users' 
      });
    }

    // Owners can only be created during store setup
    if (role === 'owner') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot invite users with owner role. Each store has one owner.' 
      });
    }

    // Check if user already exists
    const existingUser = await StoreUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Create user
    const newUser = await StoreUser.create({
      storeId,
      email,
      firstName,
      lastName,
      phone,
      role: role || 'agent',
      permissions: customPermissions || {},
      password: tempPassword,
      invitedBy: currentUser.id,
      status: 'active',
    });

    // TODO: Send invitation email with temporary password
    // await sendInvitationEmail(email, firstName, tempPassword);

    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User invited successfully',
      data: {
        ...userResponse,
        tempPassword, // Send temp password in response (remove this when email is implemented)
        permissions: newUser.getPermissions(),
      },
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { storeId, userId } = req.params;
    const { firstName, lastName, phone, role, customPermissions, status } = req.body;
    const currentUser = req.user;

    // Check permission
    if (!currentUser.can('users', 'edit')) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to edit users' 
      });
    }

    const user = await StoreUser.findOne({ where: { id: userId, storeId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot modify owner role or demote owner
    if (user.role === 'owner' || role === 'owner') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify owner role' 
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
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { storeId, userId } = req.params;
    const currentUser = req.user;

    // Check permission
    if (!currentUser.can('users', 'delete')) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete users' 
      });
    }

    const user = await StoreUser.findOne({ where: { id: userId, storeId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot delete owner
    if (user.role === 'owner') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete store owner' 
      });
    }

    // Cannot delete yourself
    if (user.id === currentUser.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const { storeId, userId } = req.params;
    const currentUser = req.user;

    // Check permission (can view self or if has users:view permission)
    if (userId !== currentUser.id && !currentUser.can('users', 'view')) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view this user' 
      });
    }

    const user = await StoreUser.findOne({ 
      where: { id: userId, storeId },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        permissions: user.getPermissions(),
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { storeId, userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const currentUser = req.user;

    // Can only change own password unless owner/admin
    if (userId !== currentUser.id && !['owner', 'admin'].includes(currentUser.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only change your own password' 
      });
    }

    const user = await StoreUser.findOne({ where: { id: userId, storeId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If changing own password, verify current password
    if (userId === currentUser.id) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset password (admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    const { storeId, userId } = req.params;
    const currentUser = req.user;

    // Only owner/admin can reset passwords
    if (!['owner', 'admin'].includes(currentUser.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only owners and admins can reset passwords' 
      });
    }

    const user = await StoreUser.findOne({ where: { id: userId, storeId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot reset owner password
    if (user.role === 'owner' && currentUser.role !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot reset owner password' 
      });
    }

    // Generate new temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    user.password = tempPassword;
    await user.save();

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, user.firstName, tempPassword);

    res.json({
      success: true,
      message: 'Password reset successfully',
      tempPassword, // Remove this when email is implemented
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login for store users
exports.storeUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await StoreUser.findOne({ 
      where: { email, status: 'active' },
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'status'],
      }],
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    if (!user.acceptedAt) {
      user.acceptedAt = new Date();
    }
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        storeId: user.storeId, 
        role: user.role,
        type: 'store_user',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          ...userResponse,
          permissions: user.getPermissions(),
        },
      },
    });
  } catch (error) {
    console.error('Store user login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get role definitions
exports.getRoleDefinitions = async (req, res) => {
  try {
    const roles = {
      owner: {
        label: 'Store Owner',
        description: 'Full access to all store features and settings',
        isAssignable: false,
      },
      admin: {
        label: 'Store Admin',
        description: 'Can manage products, inventory, discounts, coupons, and view financials',
        isAssignable: true,
        permissions: {
          users: { view: true },
          products: { view: true, create: true, edit: true, delete: true },
          orders: { view: true, edit: true, print: true },
          inventory: { view: true, adjust: true },
          financials: { view: true },
          discounts: { view: true, create: true, edit: true, delete: true },
          coupons: { view: true, create: true, edit: true, delete: true },
          settings: { view: true },
          reports: { view: true, export: true },
        },
      },
      agent: {
        label: 'Order Agent',
        description: 'Can manage and print orders, view inventory',
        isAssignable: true,
        permissions: {
          products: { view: true },
          orders: { view: true, edit: true, print: true },
          inventory: { view: true },
          discounts: { view: true },
          coupons: { view: true },
        },
      },
    };

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error('Get role definitions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
