import { Heart, Trophy, Award, Medal } from 'lucide-react';
import { GratitudePost } from '../types';

interface TopPostsRecapProps {
  posts: GratitudePost[];
}

export default function TopPostsRecap({ posts }: TopPostsRecapProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500 transition-transform duration-500 group-hover:scale-110" />;
      case 1:
        return <Award className="w-6 h-6 text-gray-400 transition-transform duration-500 group-hover:scale-110" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600 transition-transform duration-500 group-hover:scale-110" />;
      default:
        return null;
    }
  };

  const getRankBadge = (index: number) => {
    const colors = [
      'from-yellow-400 to-amber-500',
      'from-gray-300 to-gray-400',
      'from-amber-500 to-amber-600',
      'from-blue-400 to-blue-500',
      'from-green-400 to-green-500',
      'from-rose-400 to-rose-500',
      'from-purple-400 to-purple-500',
      'from-teal-400 to-teal-500',
      'from-orange-400 to-orange-500',
      'from-pink-400 to-pink-500',
    ];

    return colors[index] || 'from-gray-400 to-gray-500';
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 animate-fadeIn">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-bounce" />
        <p className="text-gray-500 text-lg transition-opacity duration-700">
          No posts yet to create a recap!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent mb-2 animate-gradient-x">
          Global Gratitude 2025 Recap
        </h2>
        <p className="text-gray-600 transition-opacity duration-700 delay-200">
          The most cherished thank-yous from our community
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-amber-200 animate-slideUp opacity-0 animate-fadeInUp"
            style={{
              animationDelay: `${index * 120}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${getRankBadge(
                  index
                )} flex items-center justify-center text-white font-bold text-lg shadow-md transition-transform duration-500 group-hover:scale-110`}
              >
                {index < 3 ? (
                  getRankIcon(index)
                ) : (
                  <span className="transition-transform duration-500 group-hover:scale-110">#{index + 1}</span>
                )}
              </div>

              <div className="flex-grow">
                <p className="text-gray-800 leading-relaxed mb-3 transition-colors duration-300 group-hover:text-rose-700">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full transition-colors duration-300 group-hover:bg-rose-100">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-bounce" />
                    <span className="font-semibold text-rose-700">
                      {post.reactions} {post.reactions === 1 ? 'heart' : 'hearts'}
                    </span>
                  </div>

                  {index < 3 && (
                    <div className="px-3 py-1.5 bg-amber-50 rounded-full transition-colors duration-300 group-hover:bg-amber-100">
                      <span className="text-amber-700 font-semibold">
                        {index === 0
                          ? 'Most Loved'
                          : index === 1
                          ? 'Fan Favorite'
                          : 'Community Pick'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Animations (Tailwind custom keyframes) */}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
