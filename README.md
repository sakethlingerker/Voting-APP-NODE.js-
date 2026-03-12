# 🗳️ SecureVote - E-Voting Platform

**Live Demo: [https://voting-app-bunc.onrender.com/](https://voting-app-bunc.onrender.com/)**

A premium, full-stack voting application built with Node.js, Express, and MongoDB. It features a stunning glassmorphic frontend and a robust JWT-authenticated backend.

---

## 🚀 Quick Start (Local)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Database**:
   Ensure MongoDB is running locally on `mongodb://localhost:27017/voting` or update your `.env` file.

3. **Seed Dummy Data**:
   Populate the database with test users and candidates:
   ```bash
   node seed.js
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```
   Visit: `http://localhost:3000`

---

## 🔐 Credentials (Dummy Data)

| Role | Aadhar Card Number | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `345678901234` | `password789` | Amit Singh |
| **Voter** | `234567890123` | `password456` | Sita Devi |
| **Voter** | `567890123456` | `password456` | Arun Patel |

---

## 🛠️ How it Works

### 1. Authentication
- Users register with their **Aadhar Card Number** (exactly 12 digits), which acts as their unique ID.
- Passwords are encrypted using **bcrypt** before being stored in MongoDB.
- Sessions are managed via **JSON Web Tokens (JWT)**.

### 2. Voting Logic
- **One Voter, One Vote**: Each voter is flagged (`isVoted: true`) after successfully casting a vote. Subsequent attempts are blocked by the backend.
- **Voter Privacy**: Votes are stored in the Candidate document, linking to the user ID, but the results are public.
- **Administrative Peace**: Admins are strictly prohibited from voting; their role is purely management.

### 3. Admin Panel
- Admins can **Create**, **Update**, and **Delete** candidates.
- Real-time vote counts are visible to the admin immediately upon login.

---

## ☁️ Deployment

The project includes a `render.yaml` file for automated deployment.

1. Push this code to GitHub.
2. Connect your repo to **Render**.
3. Set your `MONGODB_URL` in the Render environment variables dashboard.
4. Render will handle the rest!

---

## 📁 Project Structure

- `/public`: Frontend assets (HTML, Modern CSS, JS)
- `/routes`: API endpoints (User & Candidate logic)
- `/models`: Mongoose schemas (User & Candidate)
- `/dummy data`: JSON/JS seed files
- `server.js`: Main entry point
- `db.js`: Database connection config
- `seed.js`: Data injection script
