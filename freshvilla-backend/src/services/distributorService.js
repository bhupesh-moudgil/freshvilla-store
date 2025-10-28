const { Distributor, DistributorKYC } = require('../models');
const { Op } = require('sequelize');
const { sendEmail, emailTemplates } = require('../workers/emailWorker');

class DistributorService {
  // Create distributor
  async createDistributor(distributorData) {
    try {
      // Generate unique distributor code
      const distributorCode = `V${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Generate slug from company name
      const distributorSlug = this.generateSlug(distributorData.companyName);
      
      const distributor = await Distributor.create({
        ...distributorData,
        distributorPrefixId: distributorCode,
        distributorSlug,
      });

      return distributor;
    } catch (error) {
      throw new Error(`Failed to create distributor: ${error.message}`);
    }
  }

  // Get distributor with KYC
  async getDistributorWithKYC(distributorId) {
    try {
      const distributor = await Distributor.findByPk(distributorId, {
        include: [
          {
            model: DistributorKYC,
            as: 'kycDocuments',
          },
        ],
      });

      if (!distributor) {
        throw new Error('Distributor not found');
      }

      return distributor;
    } catch (error) {
      throw new Error(`Failed to get distributor: ${error.message}`);
    }
  }

  // Approve distributor and send notification
  async approveDistributor(distributorId, approvedBy, approvalNotes) {
    try {
      const distributor = await Distributor.findByPk(distributorId);

      if (!distributor) {
        throw new Error('Distributor not found');
      }

      await distributor.update({
        approvalFlag: true,
        isActive: true,
        verificationStatus: 'verified',
        approvedBy,
        approvedDate: new Date(),
      });

      // Send approval email
      const emailContent = emailTemplates.distributorApproval(distributor.companyName);
      await sendEmail({
        to: distributor.companyEmail,
        ...emailContent,
      });

      return distributor;
    } catch (error) {
      throw new Error(`Failed to approve distributor: ${error.message}`);
    }
  }

  // Reject distributor and send notification
  async rejectDistributor(distributorId, rejectionReason) {
    try {
      const distributor = await Distributor.findByPk(distributorId);

      if (!distributor) {
        throw new Error('Distributor not found');
      }

      await distributor.update({
        verificationStatus: 'rejected',
        approvalFlag: false,
        isActive: false,
      });

      // Send rejection email
      const emailContent = emailTemplates.distributorRejection(
        distributor.companyName,
        rejectionReason
      );
      await sendEmail({
        to: distributor.companyEmail,
        ...emailContent,
      });

      return distributor;
    } catch (error) {
      throw new Error(`Failed to reject distributor: ${error.message}`);
    }
  }

  // Check if distributor can sell
  isDistributorActive(distributor) {
    return (
      distributor.approvalFlag &&
      distributor.isActive &&
      !distributor.isDelete &&
      distributor.verificationStatus === 'verified'
    );
  }

  // Generate slug from company name
  generateSlug(companyName) {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Calculate distributor metrics
  async getDistributorMetrics(distributorId) {
    try {
      const distributor = await Distributor.findByPk(distributorId);

      if (!distributor) {
        throw new Error('Distributor not found');
      }

      // TODO: Calculate actual metrics from related tables
      const metrics = {
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
        kycStatus: distributor.verificationStatus,
        storeKYCStatus: distributor.storeVerificationStatus,
      };

      return metrics;
    } catch (error) {
      throw new Error(`Failed to get distributor metrics: ${error.message}`);
    }
  }

  // Search distributors
  async searchDistributors(searchTerm, filters = {}) {
    try {
      const where = {};

      if (searchTerm) {
        where[Op.or] = [
          { companyName: { [Op.iLike]: `%${searchTerm}%` } },
          { companyEmail: { [Op.iLike]: `%${searchTerm}%` } },
          { distributorPrefixId: { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }

      if (filters.verificationStatus) {
        where.verificationStatus = filters.verificationStatus;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      const distributors = await Distributor.findAll({
        where,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        order: [[filters.sortBy || 'createdAt', filters.order || 'DESC']],
      });

      return distributors;
    } catch (error) {
      throw new Error(`Failed to search distributors: ${error.message}`);
    }
  }
}

module.exports = new DistributorService();
