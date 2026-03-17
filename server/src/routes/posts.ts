import { Router } from 'express';
import {
  createPost,
  getFeed,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
} from '../controllers/posts.js';
import { likePost, unlikePost } from '../controllers/likes.js';
import { createComment, getComments, deleteComment, likeComment, unlikeComment } from '../controllers/comments.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/feed', authenticate, getFeed);
router.get('/user/:username', getUserPosts);
router.get('/:id', getPost);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

router.post('/:id/like', authenticate, likePost);
router.delete('/:id/like', authenticate, unlikePost);

router.post('/:id/comments', authenticate, createComment);
router.get('/:id/comments', getComments);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

router.post('/:id/comments/:commentId/like', authenticate, likeComment);
router.delete('/:id/comments/:commentId/like', authenticate, unlikeComment);

export default router;
