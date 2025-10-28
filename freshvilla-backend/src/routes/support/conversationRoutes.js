const express = require('express');
const router = express.Router();
const conversationController = require('../../controllers/support/conversationController');

// Customer/Agent routes
router.post('/', conversationController.createConversation);
router.get('/', conversationController.getAllConversations);
router.get('/:id', conversationController.getConversationById);

// Agent/Admin actions
router.post('/:id/assign', conversationController.assignConversation);
router.patch('/:id/status', conversationController.updateStatus);
router.patch('/:id/priority', conversationController.updatePriority);
router.post('/:id/tags', conversationController.addTags);

// Agent dashboard
router.get('/agent/:agentId/stats', conversationController.getAgentStats);

// Admin routes
router.delete('/:id', conversationController.deleteConversation);

module.exports = router;
