import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
} from '../controllers/users.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/search', searchUsers);
router.get('/:username', getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/:username/follow', authenticate, followUser);
router.delete('/:username/follow', authenticate, unfollowUser);
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);

export default router;
