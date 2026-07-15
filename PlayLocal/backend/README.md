# 🚀 PlayLocal Backend

The brain behind PlayLocal - handles all the API stuff, database, and authentication.

---

## 📦 What's in here?

This is the main server for PlayLocal. It handles:
- 🔐 User authentication (login, register, JWT tokens)
- 📝 Play date requests (send, accept, reject)
- 👥 User profiles (parents, providers, admins)
- 💾 Database connections and models
- 🔄 API routes for everything

---

## 🛠️ Tech Stack

| Thing | What I used |
|-------|-------------|
| Runtime | Node.js (v20) |
| Framework | Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| File upload | Multer |

---

## 🏃‍♂️ Getting Started

### What you need
- Node.js (v20 or higher)
- MongoDB (local or cloud)
- A code editor (VS Code works great)

### Steps to run

```bash
# 1. Go to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file from example
cp .env.example .env

# 4. Edit .env with your values (MongoDB URI, JWT secret, etc.)
# 5. Start the server
npm start