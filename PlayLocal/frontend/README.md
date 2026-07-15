# 🎨 PlayLocal Frontend

The pretty side of PlayLocal - where parents, providers, and admins actually use the app.

---

## 📦 What's in here?

This is the frontend for PlayLocal. Built with Next.js and Tailwind. It's where users:

- 🔍 Search for play spaces near them
- 📅 Book play dates
- 📋 Manage requests and bookings
- 👤 Edit profiles
- 📊 View dashboards (providers & admins)

---

## 🛠️ Tech Stack

| Thing | What I used |
|-------|-------------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Forms | React Hook Form |
| Icons | React Icons |
| Maps | Leaflet (for location) |

---

## 🏃‍♂️ Getting Started

### What you need
- Node.js (v20 or higher)
- Backend running (check the backend README)

### Steps to run

```bash
# 1. Go to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local from example
cp .env.example .env.local

# 4. Start the dev server
npm run dev