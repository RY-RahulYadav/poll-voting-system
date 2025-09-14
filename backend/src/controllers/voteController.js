const prisma = require('../utils/prismaClient');
const { io } = require('../../index');

// @desc    Create a vote for a poll option
// @route   POST /api/votes
// @access  Private
const createVote = async (req, res) => {
  try {
    const { pollOptionId } = req.body;
    const userId = req.user.id;

    if (!pollOptionId) {
      return res.status(400).json({ message: 'Please provide a poll option ID' });
    }

    // Check if the poll option exists
    const pollOption = await prisma.pollOption.findUnique({
      where: { id: pollOptionId },
      include: { poll: true }
    });

    if (!pollOption) {
      return res.status(404).json({ message: 'Poll option not found' });
    }

    // Check if the user has already voted for this poll
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        pollOption: {
          pollId: pollOption.pollId
        }
      }
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Create the vote
    await prisma.vote.create({
      data: {
        userId,
        pollOptionId
      }
    });

    // Fetch updated poll results to broadcast to clients
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollOption.pollId },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true
              }
            }
          }
        }
      }
    });

    // Map the results to a simpler format for clients
    const pollResults = updatedPoll.options.map(option => ({
      id: option.id,
      text: option.text,
      voteCount: option._count.votes
    }));

    // Broadcast the updated results to everyone viewing this poll
    io.to(pollOption.pollId).emit('poll-vote', {
      pollId: pollOption.pollId,
      results: pollResults,
      userId: userId,
      votedOptionId: pollOptionId,
      votedOptionText: pollOption.text
    });

    res.status(201).json({ message: 'Vote recorded successfully', results: pollResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get vote results for a poll
// @route   GET /api/votes/results/:pollId
// @access  Public
const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;

    // Check if the poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true
              }
            }
          }
        }
      }
    });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Map the results to a simpler format
    const results = poll.options.map(option => ({
      id: option.id,
      text: option.text,
      voteCount: option._count.votes
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if user has voted on a specific poll
// @route   GET /api/votes/check/:pollId
// @access  Private
const checkUserVote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;

    const vote = await prisma.vote.findFirst({
      where: {
        userId,
        pollOption: {
          poll: {
            id: pollId
          }
        }
      },
      include: {
        pollOption: true
      }
    });

    if (!vote) {
      return res.status(200).json({ hasVoted: false });
    }

    res.status(200).json({
      hasVoted: true,
      optionId: vote.pollOptionId,
      optionText: vote.pollOption.text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createVote,
  getPollResults,
  checkUserVote
};