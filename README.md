**Quiz Game Web App**

**Overview**
This is a full-stack quiz application with a React frontend and Django backend.
Users can play quizzes, register/login, and track scores.
Admin can manage quiz questions from Django admin.

**Features**
User registration, login, logout
Token-based auth for protected actions
Fetch quiz questions from backend
Play quiz and see score/progress
Save quiz scores
Basic user profile stats (games played, best score, accuracy)

**Tech Stack**
Frontend: React + Vite
Backend: Django
Database: SQLite (default Django DB)
Styling: CSS

**Main Backend Models**
QuizQuestion: question, options, correct answer
QuizScore: player score, wrong answers, difficulty
PlayerProfile: total games, best score, totals
UserToken: simple token for auth

**API Routes**
GET /api/questions/
GET, POST /api/scores/
POST /api/register/
POST /api/login/
POST /api/logout/
GET /api/profile/

**How to Run**
1. Backend
cd backend
python manage.py migrate
python manage.py runserver

3. Frontend
cd frontend
npm install
npm run dev
