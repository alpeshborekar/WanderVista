# WanderVista ✈️

Full-stack travel booking application built with React (Vite) and Node.js (Express + MongoDB).

## Project Structure

```
project 1/
├── backend/            # Express API, MongoDB models, Auth & Booking routes
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   └── server.js
├── frontend/           # React + Vite frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── vite.config.js
└── README.md
```

## Getting Started

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
> Server runs on `http://localhost:5001` (connected to MongoDB)

To seed initial destination data:
```bash
cd backend
node seed.js
```

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs on `http://localhost:5173`
