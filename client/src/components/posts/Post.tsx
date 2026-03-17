'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { postsApi } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface PostProps {
  post: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      avatar: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
    isLiked?: boolean;
  };
  currentUserId?: string;
  onUpdate?: () => void;
}

export function Post({ post, currentUserId, onUpdate }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postsApi.unlike(post.id);
        setLikesCount((prev) => prev - 1);
      } else {
        await postsApi.like(post.id);
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShowComments = async () => {
    if (!showComments) {
      try {
        const res = await postsApi.getComments(post.id);
        setComments(res.data.comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await postsApi.comment(post.id, { content: newComment });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const contentWithLinks = post.content
    .replace(/#(\w+)/g, '<span class="text-sky-500">#$1</span>')
    .replace(/@(\w+)/g, '<span class="text-sky-500">@$1</span>');

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex gap-3">
        <Link href={`/profile/${post.user.username}`}>
          <Avatar src={post.user.avatar} alt={post.user.displayName} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.user.username}`}
              className="font-semibold text-slate-900 hover:underline"
            >
              {post.user.displayName}
            </Link>
            <span className="text-slate-500">@{post.user.username}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 text-sm">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p
            className="mt-1 text-slate-800 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: contentWithLinks }}
          />
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm ${
                isLiked ? 'text-red-500' : 'text-slate-500'
              } hover:text-red-500 transition-colors`}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {likesCount}
            </button>
            <button
              onClick={handleShowComments}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-sky-500 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {post._count.comments}
            </button>
            {currentUserId === post.user.id && onUpdate && (
              <button
                onClick={onUpdate}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Delete
              </button>
            )}
          </div>

          {showComments && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <Button type="submit" size="sm" disabled={loading}>
                  Post
                </Button>
              </form>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar
                      src={comment.user.avatar}
                      alt={comment.user.displayName}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.user.displayName}
                        </span>
                        <span className="text-slate-500 text-xs">
                          @{comment.user.username}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
