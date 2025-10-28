const { Conversation, Message } = require('../../models');
const { Op } = require('sequelize');

class ConversationController {
  // Create new conversation
  async createConversation(req, res) {
    try {
      const {
        customerId,
        channelType,
        inboxId,
        contactName,
        contactEmail,
        contactPhone,
      } = req.body;

      // Generate conversation ID
      const conversationId = `CONV-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const conversation = await Conversation.create({
        conversationId,
        customerId,
        channelType,
        inboxId,
        contactName,
        contactEmail,
        contactPhone,
        lastActivityAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: conversation,
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
        error: error.message,
      });
    }
  }

  // Get all conversations with filters
  async getAllConversations(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        channelType,
        assignedAgentId,
        priority,
        search,
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (status) where.status = status;
      if (channelType) where.channelType = channelType;
      if (assignedAgentId) where.assignedAgentId = assignedAgentId;
      if (priority) where.priority = priority;
      if (search) {
        where[Op.or] = [
          { conversationId: { [Op.iLike]: `%${search}%` } },
          { contactName: { [Op.iLike]: `%${search}%` } },
          { contactEmail: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Conversation.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['lastActivityAt', 'DESC']],
        include: [
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
            separate: true,
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
      console.error('Get conversations error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations',
        error: error.message,
      });
    }
  }

  // Get conversation by ID
  async getConversationById(req, res) {
    try {
      const { id } = req.params;

      const conversation = await Conversation.findByPk(id, {
        include: [
          {
            model: Message,
            as: 'messages',
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation',
        error: error.message,
      });
    }
  }

  // Assign conversation to agent
  async assignConversation(req, res) {
    try {
      const { id } = req.params;
      const { assignedAgentId, assignedTeamId } = req.body;

      const conversation = await Conversation.findByPk(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      await conversation.update({
        assignedAgentId,
        assignedTeamId,
        lastActivityAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: 'Conversation assigned successfully',
        data: conversation,
      });
    } catch (error) {
      console.error('Assign conversation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign conversation',
        error: error.message,
      });
    }
  }

  // Update conversation status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const conversation = await Conversation.findByPk(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      await conversation.update({
        status,
        lastActivityAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: 'Conversation status updated',
        data: conversation,
      });
    } catch (error) {
      console.error('Update status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update conversation status',
        error: error.message,
      });
    }
  }

  // Update conversation priority
  async updatePriority(req, res) {
    try {
      const { id } = req.params;
      const { priority } = req.body;

      const conversation = await Conversation.findByPk(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      await conversation.update({
        priority,
        lastActivityAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: 'Conversation priority updated',
        data: conversation,
      });
    } catch (error) {
      console.error('Update priority error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update conversation priority',
        error: error.message,
      });
    }
  }

  // Add tags to conversation
  async addTags(req, res) {
    try {
      const { id } = req.params;
      const { tags } = req.body;

      const conversation = await Conversation.findByPk(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      const updatedTags = [...new Set([...conversation.tags, ...tags])];

      await conversation.update({
        tags: updatedTags,
        lastActivityAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: 'Tags added successfully',
        data: conversation,
      });
    } catch (error) {
      console.error('Add tags error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add tags',
        error: error.message,
      });
    }
  }

  // Get agent dashboard stats
  async getAgentStats(req, res) {
    try {
      const { agentId } = req.params;

      const openCount = await Conversation.count({
        where: {
          assignedAgentId: agentId,
          status: 'open',
        },
      });

      const pendingCount = await Conversation.count({
        where: {
          assignedAgentId: agentId,
          status: 'pending',
        },
      });

      const resolvedToday = await Conversation.count({
        where: {
          assignedAgentId: agentId,
          status: 'resolved',
          updatedAt: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          openConversations: openCount,
          pendingConversations: pendingCount,
          resolvedToday,
        },
      });
    } catch (error) {
      console.error('Get agent stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch agent stats',
        error: error.message,
      });
    }
  }

  // Delete conversation
  async deleteConversation(req, res) {
    try {
      const { id } = req.params;

      const conversation = await Conversation.findByPk(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      await conversation.destroy();

      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      console.error('Delete conversation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete conversation',
        error: error.message,
      });
    }
  }
}

module.exports = new ConversationController();
