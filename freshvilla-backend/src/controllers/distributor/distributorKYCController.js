const { DistributorKYC, Distributor } = require('../../models');

class DistributorKYCController {
  // Upload KYC document
  async uploadDocument(req, res) {
    try {
      const { distributorId, documentType, documentNumber } = req.body;
      const filePath = req.file ? req.file.path : null;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'Document file is required',
        });
      }

      // Check if distributor exists
      const distributor = await Distributor.findByPk(distributorId);
      if (!distributor) {
        return res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }

      // Create KYC document
      const kycDocument = await DistributorKYC.create({
        distributorId,
        documentType,
        documentNumber,
        filePath,
      });

      return res.status(201).json({
        success: true,
        message: 'KYC document uploaded successfully',
        data: kycDocument,
      });
    } catch (error) {
      console.error('Upload KYC document error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload KYC document',
        error: error.message,
      });
    }
  }

  // Get all KYC documents for a distributor
  async getDistributorDocuments(req, res) {
    try {
      const { distributorId } = req.params;

      const documents = await DistributorKYC.findAll({
        where: { distributorId },
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      console.error('Get KYC documents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch KYC documents',
        error: error.message,
      });
    }
  }

  // Get pending KYC documents (Admin)
  async getPendingDocuments(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await DistributorKYC.findAndCountAll({
        where: { verificationStatus: 'pending' },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: Distributor,
            as: 'distributor',
            attributes: ['id', 'businessName', 'email', 'phone', 'distributorCode'],
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
      console.error('Get pending documents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pending documents',
        error: error.message,
      });
    }
  }

  // Verify KYC document (Admin)
  async verifyDocument(req, res) {
    try {
      const { id } = req.params;
      const { verifiedBy, verificationNotes } = req.body;

      const document = await DistributorKYC.findByPk(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'KYC document not found',
        });
      }

      if (document.verificationStatus === 'verified') {
        return res.status(400).json({
          success: false,
          message: 'Document is already verified',
        });
      }

      await document.update({
        verificationStatus: 'verified',
        verifiedBy,
        verifiedAt: new Date(),
        verificationNotes,
      });

      // Check if all KYC documents are verified
      const allDocuments = await DistributorKYC.findAll({
        where: { distributorId: document.distributorId },
      });

      const allVerified = allDocuments.every(
        (doc) => doc.verificationStatus === 'verified'
      );

      if (allVerified) {
        await Distributor.update(
          { verificationStatus: 'verified' },
          { where: { id: document.distributorId } }
        );
      }

      return res.status(200).json({
        success: true,
        message: 'KYC document verified successfully',
        data: document,
      });
    } catch (error) {
      console.error('Verify document error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify document',
        error: error.message,
      });
    }
  }

  // Reject KYC document (Admin)
  async rejectDocument(req, res) {
    try {
      const { id } = req.params;
      const { verifiedBy, verificationNotes } = req.body;

      const document = await DistributorKYC.findByPk(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'KYC document not found',
        });
      }

      await document.update({
        verificationStatus: 'rejected',
        verifiedBy,
        verifiedAt: new Date(),
        verificationNotes,
      });

      // Update distributor verification status
      await Distributor.update(
        { verificationStatus: 'rejected' },
        { where: { id: document.distributorId } }
      );

      return res.status(200).json({
        success: true,
        message: 'KYC document rejected',
        data: document,
      });
    } catch (error) {
      console.error('Reject document error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reject document',
        error: error.message,
      });
    }
  }

  // Delete KYC document
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      const document = await DistributorKYC.findByPk(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'KYC document not found',
        });
      }

      // TODO: Delete file from storage

      await document.destroy();

      return res.status(200).json({
        success: true,
        message: 'KYC document deleted successfully',
      });
    } catch (error) {
      console.error('Delete document error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: error.message,
      });
    }
  }
}

module.exports = new DistributorKYCController();
