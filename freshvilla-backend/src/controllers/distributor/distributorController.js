const { Distributor, DistributorKYC } = require('../../models');
const { Op } = require('sequelize');

class DistributorController {
  // Register new distributor
  async register(req, res) {
    try {
      const {
        businessName,
        businessType,
        email,
        phone,
        contactPerson,
        gstin,
        pan,
        address,
        storefront,
      } = req.body;

      // Check if distributor already exists
      const existingDistributor = await Distributor.findOne({
        where: {
          [Op.or]: [{ email }, { phone }],
        },
      });

      if (existingDistributor) {
        return res.status(400).json({
          success: false,
          message: 'Distributor with this email or phone already exists',
        });
      }

      // Generate distributor code
      const distributorCode = `V${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create distributor
      const distributor = await Distributor.create({
        distributorCode,
        businessName,
        businessType,
        email,
        phone,
        contactPerson,
        gstin,
        pan,
        address,
        storefront,
      });

      return res.status(201).json({
        success: true,
        message: 'Distributor registered successfully',
        data: distributor,
      });
    } catch (error) {
      console.error('Distributor registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to register distributor',
        error: error.message,
      });
    }
  }

  // Get all distributors (Admin)
  async getAllDistributors(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        verificationStatus,
        search,
        sortBy = 'createdAt',
        order = 'DESC',
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (status) where.status = status;
      if (verificationStatus) where.verificationStatus = verificationStatus;
      if (search) {
        where[Op.or] = [
          { businessName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { distributorCode: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Distributor.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order]],
        include: [
          {
            model: DistributorKYC,
            as: 'kycDocuments',
            attributes: ['id', 'documentType', 'verificationStatus'],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get distributors error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch distributors',
        error: error.message,
      });
    }
  }

  // Get distributor by ID
  async getDistributorById(req, res) {
    try {
      const { id } = req.params;

      const distributor = await Distributor.findByPk(id, {
        include: [
          {
            model: DistributorKYC,
            as: 'kycDocuments',
          },
        ],
      });

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: distributor,
      });
    } catch (error) {
      console.error('Get distributor error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch distributor',
        error: error.message,
      });
    }
  }

  // Update distributor
  async updateDistributor(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const distributor = await Distributor.findByPk(id);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      // Prevent updating sensitive fields
      delete updates.distributorCode;
      delete updates.verificationStatus;
      delete updates.status;

      await distributor.update(updates);

      return res.status(200).json({
        success: true,
        message: 'Distributor updated successfully',
        data: distributor,
      });
    } catch (error) {
      console.error('Update distributor error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update distributor',
        error: error.message,
      });
    }
  }

  // Approve distributor (Admin)
  async approveDistributor(req, res) {
    try {
      const { id } = req.params;
      const { approvedBy, approvalNotes } = req.body;

      const distributor = await Distributor.findByPk(id);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      if (distributor.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Distributor is already approved',
        });
      }

      await distributor.update({
        status: 'active',
        verificationStatus: 'verified',
        approvedBy,
        approvedAt: new Date(),
        approvalNotes,
      });

      // TODO: Send approval notification to distributor

      return res.status(200).json({
        success: true,
        message: 'Distributor approved successfully',
        data: distributor,
      });
    } catch (error) {
      console.error('Approve distributor error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to approve distributor',
        error: error.message,
      });
    }
  }

  // Reject distributor (Admin)
  async rejectDistributor(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const distributor = await Distributor.findByPk(id);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      await distributor.update({
        status: 'rejected',
        verificationStatus: 'rejected',
        rejectionReason,
      });

      // TODO: Send rejection notification to distributor

      return res.status(200).json({
        success: true,
        message: 'Distributor rejected',
        data: distributor,
      });
    } catch (error) {
      console.error('Reject distributor error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reject distributor',
        error: error.message,
      });
    }
  }

  // Suspend distributor (Admin)
  async suspendDistributor(req, res) {
    try {
      const { id } = req.params;
      const { suspensionReason } = req.body;

      const distributor = await Distributor.findByPk(id);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      await distributor.update({
        status: 'suspended',
        rejectionReason: suspensionReason,
      });

      // TODO: Send suspension notification to distributor

      return res.status(200).json({
        success: true,
        message: 'Distributor suspended',
        data: distributor,
      });
    } catch (error) {
      console.error('Suspend distributor error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to suspend distributor',
        error: error.message,
      });
    }
  }

  // Get distributor dashboard stats
  async getDashboardStats(req, res) {
    try {
      const { distributorId } = req.params;

      const distributor = await Distributor.findByPk(distributorId);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      // TODO: Calculate stats from related models (orders, products, revenue)
      const stats = {
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        averageRating: distributor.rating,
        totalReviews: 0,
      };

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: error.message,
      });
    }
  }

  // Delete distributor (Admin)
  async deleteDistributor(req, res) {
    try {
      const { id } = req.params;

      const distributor = await Distributor.findByPk(id);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      await distributor.destroy();

      return res.status(200).json({
        success: true,
        message: 'Distributor deleted successfully',
      });
    } catch (error) {
      console.error('Delete distributor error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete distributor',
        error: error.message,
      });
    }
  }
}

module.exports = new DistributorController();
