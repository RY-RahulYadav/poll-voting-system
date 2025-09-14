const express = require('express');
const router = express.Router();
const { 
  createVote, 
  getPollResults, 
  checkUserVote 
} = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/results/:pollId', getPollResults);

// Protected routes
router.post('/', protect, createVote);
router.get('/check/:pollId', protect, checkUserVote);

module.exports = router;