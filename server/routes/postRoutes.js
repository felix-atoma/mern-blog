import express from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { storage } from '../utils/cloudinary.js';
import multer from 'multer';

const upload = multer({ storage });

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, upload.single('image'), createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.put('/:id/like', protect, likePost);

export default router;