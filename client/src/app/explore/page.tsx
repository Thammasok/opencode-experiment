'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { usersApi } from '@/lib/api';

export default function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const res = await usersApi.search(searchQuery);
      setUsers(res.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(query);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        searchUsers(query);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Explore</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
        />
      </form>
      <div className="space-y-3">
        {loadingUsers ? (
          <div className="text-center py-8 text-slate-500">Searching...</div>
        ) : users.length === 0 && query.length >= 2 ? (
          <div className="text-center py-8 text-slate-500">No users found</div>
        ) : (
          users.map((u) => (
            <Link
              key={u.id}
              href={`/profile/${u.username}`}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <Avatar src={u.avatar} alt={u.displayName} />
              <div>
                <div className="font-medium text-slate-900">{u.displayName}</div>
                <div className="text-sm text-slate-500">@{u.username}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
