import { GratitudePost } from '../types';

interface Props {
  posts: GratitudePost[];
  onHideToggle: (id: string, hide: boolean) => void;
  onDelete: (id: string) => void;
}

export default function AdminPanel({ posts, onHideToggle, onDelete }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Manage Posts</h2>
      {posts.length === 0 ? (
        <p>No posts to manage.</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-auto">
          {posts.map(p => (
            <div key={p.id} className="flex items-start justify-between gap-4 p-3 border rounded">
              <div className="flex-1">
                <p className="text-sm text-gray-700">{p.content}</p>
                <p className="text-xs text-gray-400">{new Date(p.created_at as unknown as string).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Reactions: {p.reactions || 0}</p>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <button onClick={() => onHideToggle(p.id, !p.hidden)} className="px-3 py-1 bg-amber-600 text-white rounded">
                  {p.hidden ? 'Unhide' : 'Hide'}
                </button>
                <button onClick={() => onDelete(p.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
