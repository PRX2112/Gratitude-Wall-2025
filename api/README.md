Vercel API Functions (local emulation)

Files in /api implement the previous server endpoints as Vercel-style serverless functions:
- GET /api/posts
- POST /api/posts
- POST /api/posts/:id/reaction

IMPORTANT CAVEAT: Vercel's serverless functions run on ephemeral file systems. Writing files inside the function (like we do here) will work in local development (`vercel dev`) and will create files in the project directory, but it is NOT durable or recommended in production on Vercel.

Recommended production options:
- Store data in an external database (Postgres, Supabase, SQLite on a persistent volume)
- Store JSON files in S3 or another object store

Local testing:
- Install Vercel CLI: `npm i -g vercel`
- Run `vercel dev` at the project root and call `http://localhost:3000/api/posts`

These functions use a repo-local `api-data/` folder to store rotated JSON files (same rotation logic as before).