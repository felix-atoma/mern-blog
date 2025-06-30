import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import CommentForm from '../components/CommentForm';
import formatDate from '../utils/formatDate';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch post');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const { data } = await api.put(`/posts/${id}/like`);
      setPost(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${id}`);
        toast.success('Post deleted successfully');
        navigate('/');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  const handleCommentAdded = (comment) => {
    setPost({
      ...post,
      comments: [...post.comments, comment]
    });
  };

  const handleCommentDeleted = (commentId) => {
    setPost({
      ...post,
      comments: post.comments.filter(comment => comment._id !== commentId)
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-8">Post not found</div>;
  }

  const isAuthor = user && user._id === post.author._id;
  const isLiked = user && post.likes.includes(user._id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.image && (
          <img src={post.image} alt={post.title} className="w-full h-64 object-cover" />
        )}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
            <div className="flex items-center space-x-4">
              <button onClick={handleLike} className="flex items-center space-x-1">
                {isLiked ? (
                  <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                <span>{post.likes.length}</span>
              </button>
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <img src={post.author.avatar} alt={post.author.username} className="h-10 w-10 rounded-full" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{post.author.username}</p>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>
          <div className="mt-6 prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Comments ({post.comments.length})</h2>
            <CommentForm postId={post._id} onCommentAdded={handleCommentAdded} />
            <div className="mt-6 space-y-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <img src={comment.author.avatar} alt={comment.author.username} className="h-8 w-8 rounded-full" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">{comment.author.username}</p>
                        <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                    {(user && (user._id === comment.author._id || user._id === post.author._id)) && (
                      <button
                        onClick={async () => {
                          try {
                            await api.delete(`/comments/${comment._id}`);
                            handleCommentDeleted(comment._id);
                            toast.success('Comment deleted successfully');
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Failed to delete comment');
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;