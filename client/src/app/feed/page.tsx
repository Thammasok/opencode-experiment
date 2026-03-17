'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PostForm } from '@/components/posts/PostForm';
import { Post } from '@/components/posts/Post';

export default function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/posts/feed', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6">
        <PostForm onSuccess={fetchPosts} />
      </div>
      <div className="space-y-4">
        {loadingPosts ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No posts yet. Follow some users or create your first post!
          </div>
        ) : (
          posts.map((post) => (
            <Post key={post.id} post={post} currentUserId={user.id} onUpdate={fetchPosts} />
          ))
        )}
      </div>
    </div>
  );
}
