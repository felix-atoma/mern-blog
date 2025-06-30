import Post from '../models/Post.js';
import mongoose from 'mongoose';

// Debugging utility
const logError = (operation, error, metadata = {}) => {
  console.error(`[${new Date().toISOString()}] ${operation} Error:`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    ...metadata
  });
};

// Database health check
const checkDatabase = () => {
  const state = mongoose.connection.readyState;
  if (state !== 1) {
    throw new Error(`Database not connected (state: ${state})`);
  }
};

// POST CONTROLLERS

export const createPost = async (req, res) => {
  try {
    checkDatabase();
    
    // Validate input
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    // Create post
    const post = await Post.create({
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id,
      image: req.file?.path
    });

    // Populate author data
    const populatedPost = await Post.populate(post, {
      path: 'author',
      select: 'username avatar'
    });

    return res.status(201).json({
      success: true,
      data: populatedPost
    });

  } catch (err) {
    logError('Create Post', err, {
      body: req.body,
      user: req.user?._id
    });

    if (err.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: Object.values(err.errors).map(e => e.message)
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate post content'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create post',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message
      })
    });
  }
};

// GET CONTROLLERS

export const getPosts = async (req, res) => {
  try {
    checkDatabase();

    // Try full population first
    let posts;
    try {
      posts = await Post.find()
        .populate({
          path: 'author',
          select: 'username avatar'
        })
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'username avatar'
          }
        })
        .sort('-createdAt')
        .lean();
    } catch (populateError) {
      logError('Post Population', populateError);
      // Fallback to basic population
      posts = await Post.find()
        .populate('author', 'username avatar')
        .sort('-createdAt')
        .lean();
    }

    // Filter out invalid documents
    const validPosts = posts.filter(post => 
      post?.author?._id && 
      post.title && 
      post.content
    );

    if (validPosts.length !== posts.length) {
      console.warn(`Filtered ${posts.length - validPosts.length} invalid posts`);
    }

    return res.json({
      success: true,
      count: validPosts.length,
      data: validPosts
    });

  } catch (err) {
    logError('Get Posts', err);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch posts',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message
      })
    });
  }
};

export const getPost = async (req, res) => {
  try {
    checkDatabase();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid post ID'
      });
    }

    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    return res.json({
      success: true,
      data: post
    });

  } catch (err) {
    logError('Get Post', err, { postId: req.params.id });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch post',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message
      })
    });
  }
};

// UPDATE CONTROLLERS

export const updatePost = async (req, res) => {
  try {
    checkDatabase();

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid post ID'
      });
    }

    // Verify post exists and belongs to user
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    // Validate updates
    const allowedUpdates = ['title', 'content', 'tags', 'image'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        error: 'Invalid updates',
        allowedUpdates
      });
    }

    // Apply updates
    updates.forEach(update => {
      if (update === 'tags') {
        post[update] = req.body[update].split(',').map(tag => tag.trim());
      } else {
        post[update] = req.body[update];
      }
    });

    const updatedPost = await post.save();
    const populatedPost = await Post.populate(updatedPost, [
      { path: 'author', select: 'username avatar' },
      { path: 'comments' }
    ]);

    return res.json({
      success: true,
      data: populatedPost
    });

  } catch (err) {
    logError('Update Post', err, {
      postId: req.params.id,
      updates: req.body
    });

    if (err.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: Object.values(err.errors).map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update post',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message
      })
    });
  }
};

export const likePost = async (req, res) => {
  try {
    checkDatabase();

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    const updatedPost = await post.save();
    return res.json({
      success: true,
      data: updatedPost
    });

  } catch (err) {
    logError('Like Post', err, {
      postId: req.params.id,
      userId: req.user._id
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to update likes',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message
      })
    });
  }
};

// DELETE CONTROLLER

export const deletePost = async (req, res) => {
  try {
    checkDatabase();

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();
    return res.json({
      success: true,
      data: {}
    });

  } catch (err) {
    logError('Delete Post', err, { postId: req.params.id });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to delete post',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message
      })
    });
  }
};