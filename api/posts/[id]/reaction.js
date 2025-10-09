const { updateReaction, readAllPosts } = require('../../_lib_storage');
const path = require('path');

module.exports = async (req, res) => {
  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: 'id required' });

  if (req.method === 'POST') {
    try {
      const { delta } = req.body || {};
      if (typeof delta !== 'number') return res.status(400).json({ error: 'delta required' });
      const ok = updateReaction(id, delta);
      if (!ok) return res.status(404).json({ error: 'post not found' });
      const all = readAllPosts();
      const updated = all.find(p => p.id === id);
      return res.status(200).json({ ok: true, post: updated });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'POST');
  res.status(405).end('Method Not Allowed');
};
