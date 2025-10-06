Local backend for Arise HRM (Express + Postgres)

Setup
- Copy .env.example to .env and adjust credentials
- npm install
- npm run dev

Endpoints
- GET /health
- Users: GET /api/users/:id, POST /api/users, PATCH /api/users/:id
- Attendance: GET /api/attendance, POST /api/attendance
- Leave: GET /api/leave-requests, POST /api/leave-requests


