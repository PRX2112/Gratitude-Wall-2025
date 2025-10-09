const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const bodyParser = require('body-parser');

const DATA_DIR = path.join(__dirname, 'data');
const FILE_PREFIX = 'posts-';
const MAX_PER_FILE = 100;
const PORT = process.env.PORT || 4000;

fs.ensureDirSync(DATA_DIR);

// Helper: list files sorted by created time
function listDataFiles() {
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.startsWith(FILE_PREFIX) && f.endsWith('.json'))
    .map(f => ({ name: f, stat: fs.statSync(path.join(DATA_DIR, f)) }))
    .sort((a, b) => a.stat.birthtimeMs - b.stat.birthtimeMs)
    .map(x => x.name);
  return files;
}

function readAllPosts() {
  const files = listDataFiles();
  const posts = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
      const arr = JSON.parse(content || '[]');
      if (Array.isArray(arr)) posts.push(...arr);
    } catch (e) {
      console.error('Failed to read', file, e.message);
    }
  }
  return posts;
}

function appendPost(post) {
  let files = listDataFiles();
  let targetFile;

  if (files.length === 0) {
    targetFile = `${FILE_PREFIX}1.json`;
    fs.writeFileSync(path.join(DATA_DIR, targetFile), JSON.stringify([post], null, 2));
    return targetFile;
  }

  const lastFile = files[files.length - 1];
  const lastContent = JSON.parse(fs.readFileSync(path.join(DATA_DIR, lastFile), 'utf8') || '[]');

  if (lastContent.length < MAX_PER_FILE) {
    lastContent.unshift(post); // add to start for newest-first behavior
    fs.writeFileSync(path.join(DATA_DIR, lastFile), JSON.stringify(lastContent, null, 2));
    return lastFile;
  }

  // rotate: create new file
  const nextIndex = files.length + 1;
  targetFile = `${FILE_PREFIX}${nextIndex}.json`;
  fs.writeFileSync(path.join(DATA_DIR, targetFile), JSON.stringify([post], null, 2));
  return targetFile;
}

function updateReaction(postId, delta) {
  // scan files and update the first matching post (IDs assumed unique)
  const files = listDataFiles();
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const arr = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    let changed = false;
    const newArr = arr.map(p => {
      if (p.id === postId) {
        p.reactions = Math.max(0, (p.reactions || 0) + delta);
        changed = true;
      }
      return p;
    });
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(newArr, null, 2));
      return true;
    }
  }
  return false;
}

function updatePost(postId, updates) {
  const files = listDataFiles();
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const arr = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    let changed = false;
    const newArr = arr.map(p => {
      if (p.id === postId) {
        p = { ...p, ...updates };
        changed = true;
      }
      return p;
    });
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(newArr, null, 2));
      return true;
    }
  }
  return false;
}

function deletePost(postId) {
  const files = listDataFiles();
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const arr = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    const newArr = arr.filter(p => p.id !== postId);
    if (newArr.length !== arr.length) {
      fs.writeFileSync(filePath, JSON.stringify(newArr, null, 2));
      return true;
    }
  }
  return false;
}

const http = require('http');
const server = http.createServer();
const app = express();
server.on('request', app);
app.use(cors());
app.use(bodyParser.json());

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  socket.on('disconnect', () => console.log('client disconnected', socket.id));
});

// GET /api/posts - returns all posts (newest first)
app.get('/api/posts', (req, res) => {
  const posts = readAllPosts();
  res.json(posts);
});

// POST /api/posts - create a new post
app.post('/api/posts', (req, res) => {
  const { id, content, createdAt, reactions } = req.body;
  if (!id || !content) return res.status(400).json({ error: 'id and content required' });
  const post = { id, content, createdAt, reactions: reactions || 0 };
  const file = appendPost(post);
  // emit to connected clients
  io.emit('new_post', post);
  res.status(201).json({ ok: true, file });
});

// PATCH /api/posts/:id - update post (e.g., hidden flag)
app.patch('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  const updates = req.body || {};
  const ok = updatePost(postId, updates);
  if (!ok) return res.status(404).json({ error: 'post not found' });
  const all = readAllPosts();
  const updated = all.find(p => p.id === postId);
  if (updated) io.emit('post_updated', updated);
  res.json({ ok: true, post: updated });
});

// DELETE /api/posts/:id - delete a post
app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  const ok = deletePost(postId);
  if (!ok) return res.status(404).json({ error: 'post not found' });
  io.emit('post_deleted', { id: postId });
  res.json({ ok: true });
});

// POST /api/posts/:id/reaction - adjust reaction (+1 or -1)
app.post('/api/posts/:id/reaction', (req, res) => {
  const postId = req.params.id;
  const { delta } = req.body;
  if (typeof delta !== 'number') return res.status(400).json({ error: 'delta required' });
  const ok = updateReaction(postId, delta);
  if (!ok) return res.status(404).json({ error: 'post not found' });
  // Broadcast updated reaction to clients (find updated post)
  const all = readAllPosts();
  const updated = all.find(p => p.id === postId);
  if (updated) io.emit('reaction_updated', { id: postId, reactions: updated.reactions });
  res.json({ ok: true });
});

server.listen(PORT, () => {
  console.log(`Gratitude file server listening on http://localhost:${PORT}`);
});
