# 🎮 Quiz Game Web App

## 📌 Overview
This is a full-stack Quiz Application built with a React frontend and Django backend.

Users can:
- Register and login
- Play quizzes
- Track their scores and performance

Admins can:
- Manage quiz questions through Django Admin Panel

---

## 🚀 Features

- ✅ User Registration, Login & Logout
- 🔐 Token-based Authentication
- 📥 Fetch quiz questions from backend API
- 🎯 Play quizzes with real-time score tracking
- 💾 Save quiz scores
- 📊 User profile statistics:
  - Total games played
  - Best score
  - Accuracy percentage

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Django
- Django REST Framework

### Database
- SQLite (Default Django Database)

---

## 🗄 Backend Models

### 1️⃣ QuizQuestion
- Question text
- Multiple options
- Correct answer
- Difficulty level

### 2️⃣ QuizScore
- Player score
- Wrong answers
- Difficulty
- Timestamp

### 3️⃣ PlayerProfile
- Total games played
- Best score
- Total correct answers
- Total wrong answers
- Accuracy

### 4️⃣ UserToken
- Custom token model for authentication

---

## 🔌 API Routes

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/questions/` | Get quiz questions |
| GET | `/api/scores/` | Get user scores |
| POST | `/api/scores/` | Save new score |
| POST | `/api/register/` | Register new user |
| POST | `/api/login/` | Login user |
| POST | `/api/logout/` | Logout user |
| GET | `/api/profile/` | Get user profile stats |

---

## ⚙️ How to Run the Project

---

### 🖥 Backend Setup

```bash
cd backend
python manage.py migrate
python manage.py runserver
```


### 🖥 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
