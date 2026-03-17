'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Post } from '@/components/posts/Post';
import { usersApi, postsApi } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  const fetchProfile = async () => {
    try {
      const username = params.username as string;
      const res = await usersApi.getProfile(username);
      setProfile(res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const username = params.username as string;
      const res = await postsApi.getUserPosts(username);
      setPosts(res.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const username = params.username as string;
      const res = await usersApi.getFollowers(username);
      setFollowers(res.data.followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const username = params.username as string;
      const res = await usersApi.getFollowing(username);
      setFollowing(res.data.following);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [params.username, currentUser]);

  useEffect(() => {
    if (profile) {
      if (activeTab === 'posts') {
        fetchPosts();
      } else if (activeTab === 'followers') {
        fetchFollowers();
      } else if (activeTab === 'following') {
        fetchFollowing();
      }
    }
  }, [activeTab, profile]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await usersApi.unfollow(profile.username);
      } else {
        await usersApi.follow(profile.username);
      }
      fetchProfile();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  if (loading || !currentUser) {
    return null;
  }

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 text-center text-slate-500">
        User not found
      </div>
    );
  }

  const isOwnProfile = currentUser.id === profile.id;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <Avatar src={profile.avatar} alt={profile.displayName} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{profile.displayName}</h1>
              <span className="text-slate-500">@{profile.username}</span>
            </div>
            {profile.bio && <p className="text-slate-600 mt-2">{profile.bio}</p>}
            <p className="text-sm text-slate-500 mt-2">
              Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
            </p>
            <div className="flex gap-6 mt-4">
              <button
                onClick={() => setActiveTab('posts')}
                className={`text-sm ${activeTab === 'posts' ? 'font-semibold' : 'text-slate-500'}`}
              >
                <span className="font-bold text-slate-900">{profile.postsCount}</span> Posts
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`text-sm ${activeTab === 'followers' ? 'font-semibold' : 'text-slate-500'}`}
              >
                <span className="font-bold text-slate-900">{profile.followersCount}</span> Followers
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`text-sm ${activeTab === 'following' ? 'font-semibold' : 'text-slate-500'}`}
              >
                <span className="font-bold text-slate-900">{profile.followingCount}</span> Following
              </button>
            </div>
          </div>
          {!isOwnProfile && (
            <Button
              variant={profile.isFollowing ? 'outline' : 'primary'}
              onClick={handleFollow}
            >
              {profile.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No posts yet</div>
          ) : (
            posts.map((post) => (
              <Post key={post.id} post={post} currentUserId={currentUser.id} onUpdate={fetchPosts} />
            ))
          )}
        </div>
      )}

      {activeTab === 'followers' && (
        <div className="space-y-3">
          {followers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No followers yet</div>
          ) : (
            followers.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300"
              >
                <Avatar src={user.avatar} alt={user.displayName} />
                <div>
                  <div className="font-medium text-slate-900">{user.displayName}</div>
                  <div className="text-sm text-slate-500">@{user.username}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'following' && (
        <div className="space-y-3">
          {following.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Not following anyone yet</div>
          ) : (
            following.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300"
              >
                <Avatar src={user.avatar} alt={user.displayName} />
                <div>
                  <div className="font-medium text-slate-900">{user.displayName}</div>
                  <div className="text-sm text-slate-500">@{user.username}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
