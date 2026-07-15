# 🎮 PlayLocal

### Find the perfect play date for your child. Connect with local play spaces and caregivers.

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🤔 What is PlayLocal?

PlayLocal helps parents find nearby play spaces, connect with trusted caregivers, and schedule play dates - all in one place.

I built this because finding good play options for kids is a pain. You either call around or ask friends. This makes it easier.

---

## ✨ Features

| 👨‍👩‍👧 Parents | 🏢 Providers | 👑 Admin |
|----------------|--------------|----------|
| Find nearby play spaces | Manage your profile | Approve new providers |
| Book play dates | Accept/reject requests | Monitor platform |
| View booking history | Track earnings | Manage users |
| Rate experiences | View analytics | Dashboard analytics |

---

## 🛠️ Tech Stack

| Category | What I used |
|----------|-------------|
| **Frontend** | React, Next.js 16, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcrypt |
| **Deployment** | Docker (optional) |

---

## 🚀 Quick Start

### What you need
- Node.js (v20 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Steps

```bash
# 1. Clone this repo
git clone https://github.com/yourusername/PlayLocal.git
cd PlayLocal

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev

# 3. Setup frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env.local
npm run dev