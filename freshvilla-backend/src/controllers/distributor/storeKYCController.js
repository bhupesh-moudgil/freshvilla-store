const { Distributor } = require('../../models');

class StoreKYCController {
  // Submit store KYC documents
  async submitStoreKYC(req, res) {
    try {
      const { distributorId } = req.params;
      const {
        establishmentLicense,
        tradeLicense,
        fssaiLicense,
        gstCertificate,
        otherDocuments = [],
      } = req.body;

      const distributor = await Distributor.findByPk(distributorId);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      const storeKYC = {
        establishmentLicense: establishmentLicense || null,
        tradeLicense: tradeLicense || null,
        fssaiLicense: fssaiLicense || null,
        gstCertificate: gstCertificate || null,
        otherDocuments,
        submittedAt: new Date(),
      };

      await distributor.update({
        storeKYC,
        storeVerificationStatus: 'pending',
      });

      return res.status(200).json({
        success: true,
        message: 'Store KYC documents submitted successfully',
        data: distributor,
      });
    } catch (error) {
      console.error('Submit store KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit store KYC',
        error: error.message,
      });
    }
  }

  // Get store KYC details
  async getStoreKYC(req, res) {
    try {
      const { distributorId } = req.params;

      const distributor = await Distributor.findByPk(distributorId, {
        attributes: [
          'id',
          'distributorPrefixId',
          'companyName',
          'storeKYC',
          'storeVerificationStatus',
          'storeVerifiedBy',
          'storeVerifiedAt',
          'storeVerificationNotes',
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
      console.error('Get store KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch store KYC',
        error: error.message,
      });
    }
  }

  // Get all pending store KYC verifications (Admin)
  async getPendingStoreKYC(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await Distributor.findAndCountAll({
        where: {
          storeVerificationStatus: 'pending',
          isDelete: false,
        },
        attributes: [
          'id',
          'distributorPrefixId',
          'companyName',
          'companyEmail',
          'companyPhone',
          'storeKYC',
          'storeVerificationStatus',
          'createdAt',
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'ASC']],
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
      console.error('Get pending store KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pending store KYC',
        error: error.message,
      });
    }
  }

  // Verify store KYC (Admin)
  async verifyStoreKYC(req, res) {
    try {
      const { distributorId } = req.params;
      const { verifiedBy, verificationNotes } = req.body;

      const distributor = await Distributor.findByPk(distributorId);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      if (distributor.storeVerificationStatus === 'verified') {
        return res.status(400).json({
          success: false,
          message: 'Store KYC is already verified',
        });
      }

      await distributor.update({
        storeVerificationStatus: 'verified',
        storeVerifiedBy: verifiedBy,
        storeVerifiedAt: new Date(),
        storeVerificationNotes: verificationNotes,
      });

      return res.status(200).json({
        success: true,
        message: 'Store KYC verified successfully',
        data: distributor,
      });
    } catch (error) {
      console.error('Verify store KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify store KYC',
        error: error.message,
      });
    }
  }

  // Reject store KYC (Admin)
  async rejectStoreKYC(req, res) {
    try {
      const { distributorId } = req.params;
      const { verifiedBy, verificationNotes } = req.body;

      const distributor = await Distributor.findByPk(distributorId);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      await distributor.update({
        storeVerificationStatus: 'rejected',
        storeVerifiedBy: verifiedBy,
        storeVerifiedAt: new Date(),
        storeVerificationNotes: verificationNotes,
      });

      return res.status(200).json({
        success: true,
        message: 'Store KYC rejected',
        data: distributor,
      });
    } catch (error) {
      console.error('Reject store KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reject store KYC',
        error: error.message,
      });
    }
  }

  // Update store KYC documents
  async updateStoreKYC(req, res) {
    try {
      const { distributorId } = req.params;
      const updates = req.body;

      const distributor = await Distributor.findByPk(distributorId);

      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      const updatedStoreKYC = {
        ...distributor.storeKYC,
        ...updates,
        updatedAt: new Date(),
      };

      await distributor.update({
        storeKYC: updatedStoreKYC,
        storeVerificationStatus: 'pending', // Reset to pending on update
      });

      return res.status(200).json({
        success: true,
        message: 'Store KYC updated successfully',
        data: distributor,
      });
    } catch (error) {
      console.error('Update store KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update store KYC',
        error: error.message,
      });
    }
  }

  // Get store KYC verification statistics (Admin)
  async getStoreKYCStats(req, res) {
    try {
      const pendingCount = await Distributor.count({
        where: {
          storeVerificationStatus: 'pending',
          isDelete: false,
        },
      });

      const verifiedCount = await Distributor.count({
        where: {
          storeVerificationStatus: 'verified',
          isDelete: false,
        },
      });

      const rejectedCount = await Distributor.count({
        where: {
          storeVerificationStatus: 'rejected',
          isDelete: false,
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          pending: pendingCount,
          verified: verifiedCount,
          rejected: rejectedCount,
          total: pendingCount + verifiedCount + rejectedCount,
        },
      });
    } catch (error) {
      console.error('Get store KYC stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch store KYC statistics',
        error: error.message,
      });
    }
  }
}

module.exports = new StoreKYCController();
