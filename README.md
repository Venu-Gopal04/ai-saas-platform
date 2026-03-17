# AI SaaS Platform — AI-Powered Writing Assistant

A full-stack AI writing assistant SaaS built with React, Node.js, MongoDB, Groq AI, and Stripe.

## 🚀 Live Demo
[Coming Soon]

## ✨ Features

- ✅ JWT Authentication (Register/Login)
- ✅ AI Writing (Blog, Email, Ad Copy, LinkedIn, Summary)
- ✅ Real-time AI Streaming with Groq (Llama 3.3 70B)
- ✅ Stripe Subscription Billing (Free/Pro/Enterprise)
- ✅ Usage tracking per plan
- ✅ Beautiful dashboard with analytics
- ✅ Dockerized for easy deployment

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI | Groq API (Llama 3.3 70B) |
| Payments | Stripe |
| Auth | JWT + bcrypt |
| DevOps | Docker, Docker Compose |

## 🏃 Run Locally

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional)

### Without Docker
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### With Docker
```bash
docker-compose up --build
```

## 📁 Project Structure
```
ai-saas-platform/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers (auth, ai, stripe)
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # MongoDB schemas (User, Generation)
│   ├── routes/         # API routes
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── context/    # Auth context (global state)
│   │   ├── pages/      # React pages
│   │   └── utils/      # Axios API config
│   └── ...
└── docker-compose.yml
```

## 🔑 Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRO_PRICE_ID=your_pro_price_id
STRIPE_ENTERPRISE_PRICE_ID=your_enterprise_price_id
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| POST | /api/ai/generate | Generate AI content (streaming) |
| GET | /api/ai/history | Get generation history |
| GET | /api/stripe/plans | Get subscription plans |
| POST | /api/stripe/create-checkout-session | Create Stripe checkout |
| POST | /api/stripe/cancel | Cancel subscription |

## 📸 Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### AI Writer
![AI Writer](screenshots/writer.png)

### Billing
![Billing](screenshots/billing.png)

## 👨‍💻 Author

**Venu Gopal**
- GitHub: [@yourusername](https://github.com/Venu-Gopal04)

## 📄 License
MIT License