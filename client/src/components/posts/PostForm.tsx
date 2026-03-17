'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { postsApi } from '@/lib/api';

interface PostFormProps {
  onSuccess?: () => void;
}

export function PostForm({ onSuccess }: PostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await postsApi.create({ content });
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} alt={user?.displayName || 'U'} />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full resize-none border-none focus:outline-none text-slate-900 placeholder-slate-400"
            rows={3}
          />
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              {content.length}/500
            </div>
            <Button
              type="submit"
              disabled={!content.trim() || loading}
              size="sm"
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
