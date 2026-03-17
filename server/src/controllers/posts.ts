import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../types/express.js';
import { z } from 'zod';

const postSchema = z.object({
  content: z.string().min(1).max(500),
});

const updatePostSchema = z.object({
  content: z.string().min(1).max(500),
});

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = postSchema.parse(req.body);
    const userId = req.user!.id;

    const hashtags = data.content.match(/#\w+/g) || [];
    const mentions = data.content.match(/@\w+/g) || [];

    const post = await prisma.post.create({
      data: {
        content: data.content,
        userId,
        hashtags: {
          create: await Promise.all(
            [...new Set(hashtags)].map(async (tag) => {
              const tagName = tag.slice(1).toLowerCase();
              return {
                hashtag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              };
            })
          ),
        },
        mentions: {
          create: await Promise.all(
            [...new Set(mentions)].map(async (mention) => {
              const username = mention.slice(1);
              const user = await prisma.user.findUnique({ where: { username } });
              return user ? { userId: user.id } : null;
            }).filter(Boolean)
          ) as { userId: string }[],
        },
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
            comments: true,
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: [...followingIds, userId] },
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
            comments: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.post.count({
      where: {
        userId: { in: [...followingIds, userId] },
      },
    });

    res.json({
      posts: posts.map((post) => ({
        ...post,
        isLiked: post.likes.length > 0,
        likes: undefined,
      })),
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

export const getUserPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
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
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.post.count({ where: { userId: user.id } });

    res.json({
      posts,
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

export const getPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const post = await prisma.post.findUnique({
      where: { id },
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
            comments: true,
          },
        },
        likes: userId ? {
          where: { userId },
          select: { id: true },
        } : false,
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({
      ...post,
      isLiked: userId ? (post.likes as { id: string }[]).length > 0 : false,
      likes: undefined,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updatePostSchema.parse(req.body);
    const userId = req.user!.id;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPost) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (existingPost.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const hashtags = data.content.match(/#\w+/g) || [];

    const post = await prisma.post.update({
      where: { id },
      data: {
        content: data.content,
        hashtags: {
          deleteMany: {},
          create: await Promise.all(
            [...new Set(hashtags)].map(async (tag) => {
              const tagName = tag.slice(1).toLowerCase();
              return {
                hashtag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              };
            })
          ),
        },
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
            comments: true,
          },
        },
      },
    });

    res.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPost) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (existingPost.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.post.delete({ where: { id } });

    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
