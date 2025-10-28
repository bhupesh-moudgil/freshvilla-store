const { Message, Conversation } = require('../../models');

class MessageController {
  // Send message
  async sendMessage(req, res) {
    try {
      const {
        conversationId,
        content,
        contentType = 'text',
        senderType,
        senderId,
        senderName,
        messageType = 'outgoing',
        attachments = [],
      } = req.body;

      // Check if conversation exists
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      // Create message
      const message = await Message.create({
        conversationId,
        content,
        contentType,
        senderType,
        senderId,
        senderName,
        messageType,
        attachments,
      });

      // Update conversation
      await conversation.update({
        lastActivityAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: conversation.messageCount + 1,
        unreadCount:
          messageType === 'incoming'
            ? conversation.unreadCount + 1
            : conversation.unreadCount,
      });

      // Calculate first response time if this is first agent reply
      if (
        senderType === 'agent' &&
        !conversation.firstResponseTime &&
        conversation.messageCount === 1
      ) {
        const responseTime = conversation.calculateFirstResponse(new Date());
        await conversation.update({ firstResponseTime: responseTime });
      }

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message,
      });
    }
  }

  // Get messages for conversation
  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows } = await Message.findAndCountAll({
        where: { conversationId },
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
      console.error('Get messages error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message,
      });
    }
  }

  // Mark message as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const message = await Message.findByPk(id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      await message.markAsRead();

      // Update conversation unread count
      const conversation = await Conversation.findByPk(message.conversationId);
      if (conversation && conversation.unreadCount > 0) {
        await conversation.update({
          unreadCount: conversation.unreadCount - 1,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Message marked as read',
        data: message,
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark message as read',
        error: error.message,
      });
    }
  }

  // Mark all conversation messages as read
  async markAllAsRead(req, res) {
    try {
      const { conversationId } = req.params;

      await Message.update(
        { readAt: new Date(), status: 'read' },
        {
          where: {
            conversationId,
            readAt: null,
          },
        }
      );

      // Reset conversation unread count
      await Conversation.update(
        { unreadCount: 0 },
        { where: { id: conversationId } }
      );

      return res.status(200).json({
        success: true,
        message: 'All messages marked as read',
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark all messages as read',
        error: error.message,
      });
    }
  }

  // Update message
  async updateMessage(req, res) {
    try {
      const { id } = req.params;
      const { content, contentType } = req.body;

      const message = await Message.findByPk(id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      await message.update({ content, contentType });

      return res.status(200).json({
        success: true,
        message: 'Message updated successfully',
        data: message,
      });
    } catch (error) {
      console.error('Update message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update message',
        error: error.message,
      });
    }
  }

  // Delete message
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;

      const message = await Message.findByPk(id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      const conversationId = message.conversationId;

      await message.destroy();

      // Update conversation message count
      const conversation = await Conversation.findByPk(conversationId);
      if (conversation) {
        await conversation.update({
          messageCount: Math.max(0, conversation.messageCount - 1),
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('Delete message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: error.message,
      });
    }
  }
}

module.exports = new MessageController();
