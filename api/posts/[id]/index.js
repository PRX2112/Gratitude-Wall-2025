const { updatePost, deletePost, readAllPosts } = require('../../_lib_storage');

module.exports = async (req, res) => {
  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: 'id required' });

  if (req.method === 'PATCH') {
    try {
      const updates = req.body || {};
      const ok = updatePost(id, updates);
      if (!ok) return res.status(404).json({ error: 'post not found' });
      const all = readAllPosts();
      const updated = all.find(p => p.id === id);
      return res.status(200).json({ ok: true, post: updated });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const ok = deletePost(id);
      if (!ok) return res.status(404).json({ error: 'post not found' });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).end('Method Not Allowed');
};
