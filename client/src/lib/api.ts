import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: { email: string; username: string; displayName: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const postsApi = {
  create: (data: { content: string }) => api.post('/posts', data),
  getFeed: (page?: number, limit?: number) => api.get('/posts/feed', { params: { page, limit } }),
  getUserPosts: (username: string, page?: number, limit?: number) =>
    api.get(`/posts/user/${username}`, { params: { page, limit } }),
  getPost: (id: string) => api.get(`/posts/${id}`),
  update: (id: string, data: { content: string }) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  like: (id: string) => api.post(`/posts/${id}/like`),
  unlike: (id: string) => api.delete(`/posts/${id}/like`),
  comment: (id: string, data: { content: string }) => api.post(`/posts/${id}/comments`, data),
  getComments: (id: string, page?: number, limit?: number) =>
    api.get(`/posts/${id}/comments`, { params: { page, limit } }),
};

export const usersApi = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  updateProfile: (data: { displayName?: string; bio?: string; avatar?: string }) =>
    api.put('/users/profile', data),
  follow: (username: string) => api.post(`/users/${username}/follow`),
  unfollow: (username: string) => api.delete(`/users/${username}/follow`),
  getFollowers: (username: string, page?: number, limit?: number) =>
    api.get(`/users/${username}/followers`, { params: { page, limit } }),
  getFollowing: (username: string, page?: number, limit?: number) =>
    api.get(`/users/${username}/following`, { params: { page, limit } }),
  search: (query: string, page?: number, limit?: number) =>
    api.get('/users/search', { params: { q: query, page, limit } }),
};
