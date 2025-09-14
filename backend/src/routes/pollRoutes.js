const express = require('express');
const router = express.Router();
const { 
  createPoll, 
  getPolls, 
  getPollById,
  updatePollStatus,
  deletePoll,
  getMyPolls
} = require('../controllers/pollController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getPolls);
router.get('/:id', getPollById);

// Protected routes
router.post('/', protect, createPoll);
router.put('/:id', protect, updatePollStatus);
router.delete('/:id', protect, deletePoll);
router.get('/user/my-polls', protect, getMyPolls);

module.exports = router;