const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'api-data');
const FILE_PREFIX = 'posts-';
const MAX_PER_FILE = 100;

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

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
    lastContent.unshift(post);
    fs.writeFileSync(path.join(DATA_DIR, lastFile), JSON.stringify(lastContent, null, 2));
    return lastFile;
  }

  const nextIndex = files.length + 1;
  targetFile = `${FILE_PREFIX}${nextIndex}.json`;
  fs.writeFileSync(path.join(DATA_DIR, targetFile), JSON.stringify([post], null, 2));
  return targetFile;
}

function updateReaction(postId, delta) {
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

module.exports = { readAllPosts, appendPost, updateReaction };
