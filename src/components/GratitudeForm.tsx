import { useState, useEffect } from 'react';
import { Send, Heart } from 'lucide-react';

interface GratitudeFormProps {
  onSubmit: (content: string) => void;
}

export default function GratitudeForm({ onSubmit }: GratitudeFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    onSubmit(content.trim());
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <div
      className={`max-w-2xl mx-auto transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4 animate-fade-in">
              <Heart className="w-5 h-5 text-rose-500 animate-bounce" />
              <h2 className="text-lg font-semibold text-gray-800">
                Share Your Gratitude
              </h2>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Thank you to... (your message is completely anonymous)"
              className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none transition-all duration-300"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between mt-4">
              <span
                className={`text-sm transition-colors duration-300 ${
                  content.length > 450
                    ? 'text-rose-600 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {content.length}/500
              </span>
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Post Gratitude
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      {/* Optional: Add keyframes for fade-in if not in Tailwind config */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  );
}
