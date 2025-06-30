import api from './api';

export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (postData) => api.post('/posts', postData);
export const updatePost = (id, postData) => api.put(`/posts/${id}`, postData);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const likePost = (id) => api.put(`/posts/${id}/like`);
export const createComment = (postId, content) => api.post(`/comments/${postId}`, { content });
export const deleteComment = (id) => api.delete(`/comments/${id}`);