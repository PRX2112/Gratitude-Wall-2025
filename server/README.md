Gratitude file server

Run:

1. cd server
2. npm install
3. npm start

Server listens on http://localhost:4000 and exposes:
- GET /api/posts         -> returns all posts (newest first)
- POST /api/posts        -> add new post (body: {id, content, createdAt, reactions})
- POST /api/posts/:id/reaction -> adjust reactions (body: {delta: 1 or -1})

Storage:
- Files in server/data named posts-1.json, posts-2.json, ... each up to 100 posts.
