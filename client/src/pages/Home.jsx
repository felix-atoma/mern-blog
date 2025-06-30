import { useEffect } from 'react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import { toast } from 'react-toastify';

const Home = () => {
  const { posts, loading, error, likePost } = usePosts();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Latest Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onLike={likePost} />
        ))}
      </div>
    </div>
  );
};

export default Home;