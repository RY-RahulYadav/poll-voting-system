const prisma = require('../utils/prismaClient');

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Private
const createPoll = async (req, res) => {
  try {
    const { question, options, isPublished = false } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        message: 'Please provide a question and at least 2 options'
      });
    }

    // Create the poll with associated options in a transaction
    const poll = await prisma.$transaction(async (tx) => {
      // Create the poll
      const newPoll = await tx.poll.create({
        data: {
          question,
          isPublished,
          creatorId: req.user.id,
        },
      });

      // Create all options for the poll
      const optionPromises = options.map(optionText => {
        return tx.pollOption.create({
          data: {
            text: optionText,
            pollId: newPoll.id,
          },
        });
      });

      await Promise.all(optionPromises);

      // Return the created poll with its options
      return tx.poll.findUnique({
        where: { id: newPoll.id },
        include: {
          options: true,
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    res.status(201).json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all polls
// @route   GET /api/polls
// @access  Public
const getPolls = async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      where: {
        isPublished: true,
      },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(polls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single poll by id
// @route   GET /api/polls/:id
// @access  Public
const getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update poll status (publish/unpublish)
// @route   PUT /api/polls/:id
// @access  Private
const updatePollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    // Check if the poll exists
    const poll = await prisma.poll.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if the user is the creator
    if (poll.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this poll' });
    }

    // Update the poll
    const updatedPoll = await prisma.poll.update({
      where: { id },
      data: { isPublished },
      include: {
        options: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json(updatedPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a poll
// @route   DELETE /api/polls/:id
// @access  Private
const deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the poll exists
    const poll = await prisma.poll.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if the user is the creator
    if (poll.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }

    // Delete the poll (this will cascade delete options and votes)
    await prisma.poll.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get polls created by the current user
// @route   GET /api/polls/my-polls
// @access  Private
const getMyPolls = async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      where: {
        creatorId: req.user.id,
      },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(polls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPoll,
  getPolls,
  getPollById,
  updatePollStatus,
  deletePoll,
  getMyPolls,
};