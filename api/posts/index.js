const { readAllPosts, appendPost } = require('../_lib_storage');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const posts = readAllPosts();
    res.status(200).json(posts);
    return;
  }

  if (req.method === 'POST') {
    try {
      const { id, content, createdAt, reactions } = req.body || {};
      if (!id || !content) return res.status(400).json({ error: 'id and content required' });
      const post = { id, content, createdAt, reactions: reactions || 0 };
      const file = appendPost(post);
      res.status(201).json({ ok: true, file });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end('Method Not Allowed');
};
