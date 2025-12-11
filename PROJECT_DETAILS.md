# Campus Flow - Project Documentation

## 1. Project Overview
**Campus Flow** (formerly Shivalik Learn Hub) is a comprehensive academic resource platform designed to help students access notes, past papers (PYQs), and study materials. It integrates gamification and social features to encourage learning and collaboration.

### Key Features
*   **Resource Management**: Upload, browse, and view notes, videos, and presentations.
*   **Smart Dashboard**: Personalized view with stats, daily missions, and new content alerts.
*   **Gamification**: Earn Coins & XP, unlock badges, and compete on leaderboards.
*   **Study Rooms**: Virtual focus rooms with Pomodoro timers and live chat.
*   **Community Forum**: Ask questions, share insights, and interact with peers.
*   **Admin Panel**: Manage users, approve uploads, and monitor platform analytics.

## 2. Technology Stack

### Frontend
*   **Framework**: [React](https://react.dev/) (v18) with [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `tailwindcss-animate`
*   **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **State Management**: React Context & Hooks
*   **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
*   **Routing**: [React Router](https://reactrouter.com/) (v6)

### Backend & Database
*   **Platform**: [Supabase](https://supabase.com/) (Backend-as-a-Service)
*   **Database**: PostgreSQL
*   **Auth**: Supabase Auth (Email + Google OAuth)
*   **Storage**: Supabase Storage (File uploads for PDFs, etc.)
*   **Real-time**: Supabase Realtime (Chat, Notifications, Live Stats)

## 3. Project Structure

```
src/
├── admin/              # Admin dashboard components
├── api/                # API utilities (if any specific wrappers)
├── assets/             # Static assets (images, logos)
├── components/
│   ├── admin/          # Admin-specific UI
│   ├── common/         # Shared components (Sidebar, Navbar)
│   ├── dashboard/      # Dashboard widgets
│   ├── forum/          # Community forum components
│   ├── gamification/   # Badges, Missions, Leaderboard
│   ├── landing/        # Landing page sections
│   ├── personalization/# Onboarding & recommendations
│   ├── resources/      # Resource cards, lists, viewers
│   ├── study/          # Study room & tools
│   └── ui/             # Reusable UI primitives (Buttons, Inputs)
├── contexts/           # React Contexts (Auth, Selection, Theme)
├── hooks/              # Custom Hooks (useAuth, useResources, useGamification)
├── lib/                # Library configs (Supabase client, utils)
├── pages/              # Main route pages (Dashboard, Browse, Profile)
├── services/           # Service layer logic
└── styles/             # Global CSS
```

## 4. Database Schema (Key Tables)

*   `profiles`: User users, college/course info, gamification stats (coins, xp).
*   `resources`: Main content table (files, links, metadata).
*   `colleges`, `courses`, `years`: Academic hierarchy for filtering.
*   `user_missions`, `missions`: Gamification tasks and tracking.
*   `user_badges`, `badges`: Achievement system.
*   `study_rooms`, `room_messages`: Data for virtual study spaces.
*   `forum_threads`, `forum_posts`: Community discussions.

## 5. Development Setup

### Prerequisites
*   Node.js (v16+)
*   NPM or Yarn

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
Access the app at `http://localhost:8080`.

### Building for Production
```bash
npm run build
```

## 6. Environment Variables
The project relies on Supabase. Ensure `.env` or `.env.local` contains:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
