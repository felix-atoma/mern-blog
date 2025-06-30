import { useState, useEffect } from 'react';
import api from '../services/api';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts');

        // ✅ Fix: extract the array of posts from the response
        if (data.success && Array.isArray(data.data)) {
          setPosts(data.data);
        } else {
          throw new Error('Unexpected response structure');
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch posts'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const createPost = async (postData) => {
    try {
      const { data } = await api.post('/posts', postData);
      setPosts([data.data, ...posts]); // make sure to access data.data
      return data.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to create post';
    }
  };

  const updatePost = async (id, postData) => {
    try {
      const { data } = await api.put(`/posts/${id}`, postData);
      setPosts(posts.map(post => post._id === id ? data.data : post));
      return data.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update post';
    }
  };

  const deletePost = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter(post => post._id !== id));
    } catch (err) {
      throw err.response?.data?.message || 'Failed to delete post';
    }
  };

  const likePost = async (id) => {
    try {
      const { data } = await api.put(`/posts/${id}/like`);
      setPosts(posts.map(post => post._id === id ? data.data : post));
      return data.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to like post';
    }
  };

  return { posts, loading, error, createPost, updatePost, deletePost, likePost };
};
