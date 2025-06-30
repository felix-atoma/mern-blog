import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import formatDate from '../utils/formatDate';
import truncateText from '../utils/truncateText';

const PostCard = ({ post, onLike }) => {
  const { user } = useAuth();

  const likes = post.likes || [];
  const comments = post.comments || [];
  const tags = post.tags || [];

  const isLiked = user && likes.includes(user._id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <Link
            to={`/posts/${post._id}`}
            className="text-xl font-bold text-gray-800 hover:text-indigo-600"
          >
            {post.title}
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onLike(post._id)}
              className="text-gray-500 hover:text-red-500"
            >
              {isLiked ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </button>
            <span className="text-sm text-gray-500">{likes.length}</span>
            <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">{comments.length}</span>
          </div>
        </div>

        <p className="mt-2 text-gray-600">{truncateText(post.content, 100)}</p>

        <div className="mt-4 flex items-center justify-between">
          <Link
            to={`/users/${post.author?._id}`}
            className="flex items-center"
          >
            <img
              src={post.author?.avatar}
              alt={post.author?.username}
              className="h-8 w-8 rounded-full"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {post.author?.username || 'Unknown'}
            </span>
          </Link>
          <span className="text-sm text-gray-500">
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
