import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createComment } from '../services/postService';
import { toast } from 'react-toastify';

const CommentForm = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const comment = await createComment(postId, content);
      onCommentAdded(comment);
      setContent('');
      toast.success('Comment added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to add comment');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Please login to leave a comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex items-start space-x-2">
        <img src={user.avatar} alt={user.username} className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Post Comment
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;