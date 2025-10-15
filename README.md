# Gratitude Wall 2025

A global board for sharing thank-yous to anyone or anything that made a difference in 2025.

## Features

- 🎯 Share gratitude messages
- 🔄 Real-time updates with Supabase
- ❤️ React to posts with hearts
- 🔒 GitHub OAuth authentication
- 👑 Admin panel for content moderation
- 📱 Responsive design with Tailwind CSS

## How It Works

- **Sign in with GitHub** to share your gratitude messages
- **React to Posts** with hearts to show appreciation
- **Top Posts** view to see the most appreciated messages
- **Admin Panel** for content moderation (admin users only)

## Setup

1. Create a Supabase project at https://supabase.com

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Set your Supabase URL and anon key in `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Configure GitHub OAuth in your Supabase dashboard:
   - Go to Authentication > Settings > External OAuth Providers
   - Enable GitHub auth and add your callback URL

5. Set admin emails (optional):
   ```
   ADMIN_EMAILS=admin@example.com,another@example.com
   ```

6. Apply database migrations:
   ```bash
   supabase db push migrations/
   ```

7. Install dependencies:
   ```bash
   npm install
   ```

8. Start the development server:
   ```bash
   npm run dev
   ```

## Technologies

- React with TypeScript
- Supabase for:
  - User authentication
  - Real-time updates
  - PostgreSQL database
- Tailwind CSS for styling
- Row Level Security (RLS) for data protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Requesttitude Wall

A global board for sharing anonymous thank-yous to anyone or anything that made a difference in 2025.

---

## How It Works

- **Post Anonymously:** Express gratitude without revealing your identity.
- **React to Posts:** Show support and appreciation for others' messages.
- **Global Recap:** The most appreciated posts will feature in the “Global Gratitude 2025” recap animation.

---

Join the movement—spread positivity and celebrate the helpers of 2025!