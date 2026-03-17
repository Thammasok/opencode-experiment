import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../types/express.js';

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: { postId: id, userId },
      },
    });

    if (existingLike) {
      res.status(400).json({ error: 'Already liked' });
      return;
    }

    await prisma.like.create({
      data: { postId: id, userId },
    });

    const likesCount = await prisma.like.count({ where: { postId: id } });

    res.json({ likesCount });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unlikePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: { postId: id, userId },
      },
    });

    if (!existingLike) {
      res.status(400).json({ error: 'Not liked' });
      return;
    }

    await prisma.like.delete({
      where: { id: existingLike.id },
    });

    const likesCount = await prisma.like.count({ where: { postId: id } });

    res.json({ likesCount });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
