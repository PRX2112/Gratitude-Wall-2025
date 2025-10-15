import { Heart } from 'lucide-react';
import { GratitudePost } from '../types';

interface GratitudeCardProps {
  post: GratitudePost;
  onReact: (postId: string) => void;
  hasReacted: boolean;
  isSignedIn?: boolean;
  isLoading?: boolean;
}

export default function GratitudeCard({ post, onReact, hasReacted, isSignedIn = true, isLoading = false }: GratitudeCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-amber-200 flex flex-col
      animate-fade-in"
    >
      <p
        className="text-gray-800 leading-relaxed flex-grow mb-4 transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:text-amber-700 animate-slide-up"
      >
        {post.content}
      </p>

      <div
        className="flex items-center justify-between pt-4 border-t border-gray-100 transition-all duration-500 animate-fade-in"
      >
        <span
          className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-amber-600 animate-fade-in"
        >
          {formatDate((post.created_at as unknown as string) || '')}
        </span>

        {isSignedIn ? (
          <button
            onClick={() => !isLoading && onReact(post.id)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              hasReacted
                ? 'bg-rose-500 text-white shadow-md hover:shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-600'
            } ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-110'} animate-pop`}
            title={hasReacted ? "Remove reaction" : "React to this post"}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${
                  hasReacted ? 'fill-white animate-heart-beat' : ''
                }`}
              />
            )}
            <span className="font-semibold transition-all duration-300 animate-bounce">
              {post.reactions}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-500">
            <Heart className="w-4 h-4" />
            <span className="font-semibold">{post.reactions}</span>
          </div>
        )}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s ease;
        }
        .animate-slide-up {
          animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .animate-pop {
          animation: popIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .animate-heart-beat {
          animation: heartBeat 0.5s;
        }
        .animate-bounce {
          animation: bounce 0.7s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
