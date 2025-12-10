# 🎓 Campus Flow (formerly Shivalik Learn Hub)

**Campus Flow** is the ultimate smart academic resource platform designed to bridge the gap between students, faculty, and quality study materials. It combines a robust resource library with gamification, AI tools, and community features to create an engaging learning ecosystem.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Key Features

### 📚 **Smart Resource Library**
- **Organized Content**: Notes, PYQs, specific to College, Course, and Year.
- **Search & Filter**: Powerful search with filters for Subject, Type, and Sort.
- **Preview & Download**: Secure PDF viewing and tracking.

### 🪙 **Gamification & Rewards**
- **Coin System**: Earn coins for uploading approved resources.
- **Leaderboard**: Compete with peers for "Top Contributor" status.
- **Badges**: Unlock achievements (Founding Member, Expert Uploader, etc.).
- **Missions**: Daily/Weekly tasks to earn XP.

### 🤖 **AI-Powered Tools** (Coming Soon/Beta)
- **AI Doubt Solver**: Get instant answers to academic queries.
- **PDF Summarizer**: AI-generated summaries of lecture notes.
- **Voice Notes**: Speech-to-text integration.

### 🤝 **Community & Collaboration**
- **Q&A Forum**: StackOverflow-style forum for academic doubts.
- **Micro-Communities**: Dedicated groups for clubs and interests.
- **Live Study Rooms**: Real-time collaborative study spaces.

### 🔐 **Secure & Scalable**
- **Role-Based Access**: Student, Admin, Superadmin roles.
- **Authentication**: Secure Email/Password and Google OAuth via Supabase.
- **Admin Dashboard**: Comprehensive analytics and user management.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Query (TanStack Query)
- **Deployment**: Netlify

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/campus-flow.git
    cd campus-flow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

---

## 🗄️ Database Schema (Supabase)

Key tables used in the project:
- **`profiles`**: User data (college, course, coins, role).
- **`resources`**: Stores metadata for files (PDfs linked to Storage).
- **`gamification_badges`**: Badge definitions.
- **`user_badges`**: Badges earned by users.
- **`coin_transactions`**: Ledger for coin history.
- **`questions` / `answers`**: Forum data.

---

## 👨‍💻 About the Developer

**Hi, I’m Samir Pandey** 👋

I am a **B.Tech CSE (2nd Year)** student at **Shivalik College of Engineering** and the **Treasurer of AeroShakti Drone Club (DroneX)**.
I’m passionate about building drones, full-stack development, and creating useful campus tools like **CampusFlow**, a modern student resource platform.

### 🔧 What I Do
- **Full-stack developer** (React, TypeScript, Supabase)
- **Drone development & 3D modeling** (OpenSCAD, Ultimaker S5)
- **Building a programmable aerial–aquatic hybrid drone**
- **Managing college technical clubs & student tech initiatives**

### 📌 Major Roles
- **Treasurer** – AeroShakti Drone Club (DroneX)
- **Full-Stack Developer** – HostelHub & CampusFlow projects
- **Working on DSA + Web Dev consistently**
- **Part of DroneX founding & branding team**

### 🚀 Current Projects
- **CampusFlow** – Smart academic resource system
- **Hybrid Drone** (Fly, Float, Underwater) project under ERP HOD guidance
- **HostelHub** – Hostel booking & management web app
- **DroneX club website** (React + TypeScript with advanced UI/animations)

### 📚 Learning & Improving
- **DSA** (Data Structures & Algorithms)
- **Full-Stack Web Development**
- **Drone flight physics, ESC/motor tuning, CAD design**
- **Building large React projects with clean architecture**

### 📞 Contact
- **Email**: [pamdeysamir@gmail.com](mailto:pamdeysamir@gmail.com)
- **Phone**: +91 7209853850
- **Instagram (Drone Club)**: [@droneclubshivalik](https://www.instagram.com/droneclubshivalik/)

---

> © 2024 Campus Flow. All rights reserved.
