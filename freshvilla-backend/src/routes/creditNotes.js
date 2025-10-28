const express = require('express');
const router = express.Router();
const creditNoteController = require('../controllers/creditNoteController');
const { protect, adminOnly } = require('../middleware/auth');

// Statistics (admin only)
router.get('/stats', protect, adminOnly, creditNoteController.getCreditNoteStats);

// CRUD operations
router.post('/', protect, creditNoteController.createCreditNote);
router.get('/', protect, creditNoteController.getCreditNotes);
router.get('/:id', protect, creditNoteController.getCreditNote);
router.delete('/:id', protect, adminOnly, creditNoteController.voidCreditNote);

// Workflow operations
router.put('/:id/approve', protect, creditNoteController.approveCreditNote);
router.put('/:id/apply', protect, creditNoteController.applyCreditNote);

module.exports = router;
