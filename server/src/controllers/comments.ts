import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../types/express.js';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1).max(500),
});

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = commentSchema.parse(req.body);
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId: id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { postId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.comment.count({ where: { postId: id } });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user!.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const likeComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: { commentId, userId },
      },
    });

    if (existingLike) {
      res.status(400).json({ error: 'Already liked' });
      return;
    }

    await prisma.commentLike.create({
      data: { commentId, userId },
    });

    const likesCount = await prisma.commentLike.count({ where: { commentId } });

    res.json({ likesCount });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unlikeComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: { commentId, userId },
      },
    });

    if (!existingLike) {
      res.status(400).json({ error: 'Not liked' });
      return;
    }

    await prisma.commentLike.delete({
      where: { id: existingLike.id },
    });

    const likesCount = await prisma.commentLike.count({ where: { commentId } });

    res.json({ likesCount });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
