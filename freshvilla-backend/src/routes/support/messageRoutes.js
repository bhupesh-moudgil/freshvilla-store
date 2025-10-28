const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/support/messageController');

// Message operations
router.post('/', messageController.sendMessage);
router.get('/conversation/:conversationId', messageController.getConversationMessages);
router.patch('/:id/read', messageController.markAsRead);
router.post('/conversation/:conversationId/read-all', messageController.markAllAsRead);
router.put('/:id', messageController.updateMessage);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
