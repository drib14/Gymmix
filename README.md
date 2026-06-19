# 🏋️ Gymmix — Train Smarter. Live Stronger.

![Gymmix](./client/public/splash.png)

> A production-grade **MERN stack** gym fitness tracker — packed with exercise libraries, workout planning, nutrition tracking, body metrics, goals, analytics, subscription payments, and more.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, React Router v6, Zustand, Axios, Recharts |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas (`Gymmix` database) |
| **Auth** | JWT (Access + Refresh tokens), bcrypt, OTP via Email |
| **File Storage** | Cloudinary (avatar + media uploads) |
| **Email** | Nodemailer (Gmail SMTP) — OTP, welcome, newsletter |
| **Payments** | Paymongo REST API (subscription tiers) |
| **Geolocation** | LocationIQ Geocoding API |
| **Real-time** | Socket.IO (in-app notifications) |
| **Styling** | Vanilla CSS, CSS Variables, micro-animations |
| **Icons** | react-icons |
| **Fonts** | Outfit (headings) + Inter (body) — Google Fonts |

---

## 📦 Modules & Features

### 🔐 Authentication
- Register with first name, last name, username, email, password
- Email OTP verification on registration
- JWT access + refresh token strategy (auto-rotation)
- Forgot / Reset password via email OTP
- Legal terms acceptance on registration

### 👤 User Profile
- Avatar upload via Cloudinary
- Edit personal info, fitness level, goals summary
- View personal stats at a glance

### 🏋️ Exercise Library
- 50+ pre-seeded exercises across all muscle groups
- Filter by muscle group, equipment, difficulty level
- Search by name or keyword
- Admin can add / edit / delete exercises
- Each exercise has: name, description, muscles, equipment, sets/reps guide, video URL, image

### 📋 Workout Planning
- Create custom workout plans (name, days, exercises)
- Drag-drop exercise reordering
- Set/rep/rest configuration per exercise
- Clone, edit, delete plans

### ⏱️ Active Workout Session
- Start a workout from a plan
- Live rest timer between sets
- Log completed sets with actual reps & weight
- Complete session → auto-save to workout log

### 📜 Workout History
- Full history of all logged sessions
- Filter by date range, muscle group, plan
- View detailed session breakdown

### 🥗 Nutrition Tracker
- Log daily meals (name, calories, protein, carbs, fats)
- Daily macro totals with progress bars
- Weekly summary chart
- Search food items

### 📏 Body Metrics
- Track weight, body fat %, BMI, measurements (chest, waist, hips, arms, legs)
- Historical chart view
- Goal comparison overlays

### 🎯 Fitness Goals
- Create goals: weight loss, muscle gain, endurance, custom
- Set target values + deadlines
- Progress tracker with % completion
- Mark goals as achieved

### 📊 Analytics Dashboard
- Workout frequency heatmap
- Volume progression over time
- Macro trends
- Body metric trends
- Streak tracker

### 💳 Subscription Plans
- **Free** — Basic features, limited logs
- **Pro** — Full access, advanced analytics
- **Elite** — All features + priority support + meal plans
- Powered by Paymongo (Philippine payments)
- Webhook handling for payment events

### 📧 Newsletter
- Subscribe from landing page or footer
- Welcome email on subscription
- Unsubscribe link in every email
- Admin can send newsletters to all subscribers

### 📝 Blog & FAQ
- Admin-managed blog posts (title, content, tags, cover image)
- Public FAQ page (searchable, categorized)
- Rich content display

### 🔔 Notifications
- In-app notification center (Socket.IO)
- Goal achieved, workout streak, subscription, system alerts
- Mark as read / clear all

### 🛡️ Admin Panel
- Manage users (view, ban, role assignment)
- Manage exercises (full CRUD)
- Manage blog posts (full CRUD)
- Manage newsletter campaigns
- View platform analytics

---

## 🗂️ Project Structure

```
Gymmix/
├── .gitignore
├── README.md
├── server/                  # Express API
│   ├── .env                 # Environment variables
│   ├── index.js
│   ├── config/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
└── client/                  # Vite + React
    ├── .env
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   ├── hooks/
    │   ├── services/
    │   ├── utils/
    │   └── styles/
    └── vite.config.js
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri-with-Gymmix-db>
ACCESS_TOKEN_SECRET=<your-access-token-secret>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
EMAIL_USER=<your-gmail>
EMAIL_PASSWORD=<your-gmail-app-password>
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
PAYMONGO_SECRET_KEY=<paymongo-secret-key>
PAYMONGO_PUBLIC_KEY=<paymongo-public-key>
LOCATIONIQ_ACCESS_TOKEN=<locationiq-token>
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_PAYMONGO_PUBLIC_KEY=<paymongo-public-key>
VITE_LOCATIONIQ_ACCESS_TOKEN=<locationiq-token>
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd Gymmix

# 2. Install backend dependencies
cd server
npm install

# 3. Create server/.env (see above)
cp .env.example .env
# Fill in your environment variables

# 4. Seed the exercise database
npm run seed

# 5. Start the backend
npm run dev

# 6. In a new terminal, install frontend
cd ../client
npm install

# 7. Create client/.env (see above)
cp .env.example .env

# 8. Start the frontend
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

| Group | Base Path |
|---|---|
| Auth | `/auth` |
| Users | `/users` |
| Exercises | `/exercises` |
| Workout Plans | `/workout-plans` |
| Workout Logs | `/workout-logs` |
| Nutrition | `/nutrition` |
| Body Metrics | `/body-metrics` |
| Goals | `/goals` |
| Subscriptions | `/subscriptions` |
| Newsletter | `/newsletter` |
| Blog | `/blog` |
| Notifications | `/notifications` |
| Analytics | `/analytics` |
| Reviews | `/reviews` |

---

## 🔄 Changelog

### v1.0.0 — Initial Release
- Full MERN stack scaffold
- Authentication (register, login, OTP, password reset)
- Exercise library with 50+ seeded exercises
- Workout plan builder + active session timer
- Nutrition macro tracker
- Body metrics tracking
- Fitness goals
- Analytics dashboard
- Paymongo subscription plans
- Newsletter system
- Blog + FAQ
- In-app notifications (Socket.IO)
- Admin panel
- Responsive design (mobile-first)
- Dark-theme design system

---

## 📄 License

MIT © Gymmix 2026
