# Smart Expense Tracker (MERN)

Production-ready expense tracker built with **MongoDB, Express, React, Node.js**.

## ✨ Features

- 🔐 JWT auth (register / login / logout) with bcrypt password hashing
- 💸 Full CRUD for expenses (title, amount, category, date, notes)
- 💰 Income management & monthly tracking
- 📊 Dashboard analytics (income vs expense, balance, monthly trend, category breakdown)
- 🧠 Smart insights (overspending detection, MoM comparison, top category)
- 🎯 Monthly category budgets with alerts (80% warning / 100% exceeded)
- 🔍 Search by title + filter by category / date range / amount
- 🌗 Dark mode, pagination, CSV export, loading skeletons, toast notifications
- 📱 Fully responsive — Tailwind + shadcn-style UI + Recharts

## 🏗 Architecture

```
smart-expense-tracker/
├── backend/                  # Node + Express + Mongoose (MVC)
│   ├── src/
│   │   ├── config/           # db connection
│   │   ├── controllers/      # route handlers
│   │   ├── middleware/       # auth, error handling
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── validators/       # express-validator schemas
│   │   ├── utils/            # helpers (jwt, etc.)
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/                 # React + Vite + Tailwind + Recharts
    ├── src/
    │   ├── api/              # axios instance + endpoint wrappers
    │   ├── components/       # ui, layout, charts, feature folders
    │   ├── context/          # AuthContext, ThemeContext
    │   ├── hooks/
    │   ├── pages/            # Login, Register, Dashboard, Expenses, Income, Budgets
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env        # fill in MONGO_URI + JWT_SECRET
npm install
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Frontend reads `VITE_API_URL` (defaults to `http://localhost:5000/api`).

## 🔑 Environment variables

`backend/.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

`frontend/.env` (optional)
```
VITE_API_URL=http://localhost:5000/api
```

## 📡 API routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET  | `/api/auth/me` | Current user | ✅ |
| GET  | `/api/expenses` | List (filters, pagination, search) | ✅ |
| POST | `/api/expenses` | Create | ✅ |
| PUT  | `/api/expenses/:id` | Update | ✅ |
| DELETE | `/api/expenses/:id` | Delete | ✅ |
| GET  | `/api/expenses/export/csv` | Export CSV | ✅ |
| GET  | `/api/income` | List | ✅ |
| POST | `/api/income` | Create | ✅ |
| PUT  | `/api/income/:id` | Update | ✅ |
| DELETE | `/api/income/:id` | Delete | ✅ |
| GET  | `/api/budgets` | List | ✅ |
| POST | `/api/budgets` | Upsert (category+month) | ✅ |
| DELETE | `/api/budgets/:id` | Delete | ✅ |
| GET  | `/api/dashboard/summary` | Totals + balance | ✅ |
| GET  | `/api/dashboard/trends` | Monthly trend | ✅ |
| GET  | `/api/dashboard/by-category` | Category breakdown | ✅ |
| GET  | `/api/dashboard/insights` | Smart insights | ✅ |

## 🗃 Database schema

- **User**: `name, email (unique), password (hashed), createdAt`
- **Expense**: `user (ref), title, amount, category, date, notes`
- **Income**: `user (ref), source, amount, date, notes`
- **Budget**: `user (ref), category, monthlyLimit, month (YYYY-MM)` — unique `(user, category, month)`

## 📦 Tech

**Backend:** Express 4, Mongoose 8, jsonwebtoken, bcryptjs, express-validator, helmet, cors, morgan, dotenv
**Frontend:** React 18, Vite 5, React Router 6, Axios, TailwindCSS 3, Recharts, react-hot-toast, lucide-react, date-fns

## 🪪 License

MIT
