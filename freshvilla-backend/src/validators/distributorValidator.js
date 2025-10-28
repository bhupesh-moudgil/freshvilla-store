const { body, param, query } = require('express-validator');

const distributorValidators = {
  // Distributor registration
  register: [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('contactPersonName').trim().notEmpty().withMessage('Contact person name is required'),
    body('companyEmail').isEmail().withMessage('Valid email is required'),
    body('companyPhone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number required'),
    body('companyGST').matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Valid GST number required'),
    body('companyPAN').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Valid PAN number required'),
    body('companyAddress1').trim().notEmpty().withMessage('Address is required'),
    body('companyCity').trim().notEmpty().withMessage('City is required'),
    body('companyState').trim().notEmpty().withMessage('State is required'),
    body('companyStateCode').trim().notEmpty().withMessage('State code is required'),
    body('companyPincode').matches(/^[0-9]{6}$/).withMessage('Valid 6-digit pincode required'),
  ],

  // Update distributor
  update: [
    param('id').isUUID().withMessage('Valid distributor ID required'),
    body('companyName').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
    body('companyEmail').optional().isEmail().withMessage('Valid email required'),
    body('companyPhone').optional().matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number required'),
  ],

  // Get distributor by ID
  getById: [
    param('id').isUUID().withMessage('Valid distributor ID required'),
  ],

  // Approve/Reject distributor
  approve: [
    param('id').isUUID().withMessage('Valid distributor ID required'),
    body('approvedBy').isUUID().withMessage('Valid approver ID required'),
    body('approvalNotes').optional().trim(),
  ],

  reject: [
    param('id').isUUID().withMessage('Valid distributor ID required'),
    body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required'),
  ],

  // Query parameters
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['active', 'pending', 'suspended', 'rejected']).withMessage('Invalid status'),
  ],
};

module.exports = distributorValidators;
