# 🛒 ShopEase — Shopping Made Easy!

A full-stack E-Commerce application built with the MERN stack, 
featuring AI-powered product search, Razorpay payments, 
and a complete admin dashboard.

## 🌐 Live Demo

| Platform | URL |
|---|---|
| Frontend | https://shop-ease-ten.vercel.app |
| Backend API | https://shopease-backend-8brj.onrender.com |

## 🔐 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopease.com | admin123 |
| Customer | rahul@shopease.com | rahul123 |

## 🚀 Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS v4
- React Router DOM
- Context API (Auth + Cart + Theme)
- Axios
- Recharts
- React Hot Toast
- Lucide React

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt
- Multer + Cloudinary
- Razorpay
- Nodemailer
- Claude AI API

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas
- Images → Cloudinary

## ✨ Features

### Customer Features
- Register/Login with JWT (HTTP-only cookies)
- Browse all products with search + filter + pagination
- Debounced search (500ms delay)
- Product detail with image gallery
- Add to cart + update quantity + remove
- Apply coupon codes at checkout
- Razorpay online payment
- Order history with status tracking
- Cancel orders
- Product reviews and star ratings
- Wishlist (save products for later)
- User profile management
- Dark/Light mode toggle
- Fully responsive design

### Admin Features
- Secure admin dashboard
- Total revenue + orders + users + products stats
- Monthly sales charts (Recharts)
- Low stock alerts
- Add/Delete products
- AI-generated product descriptions
- Manage all orders + update status
- Ban/Unban users

### AI Features (Claude AI)
- 🤖 AI Shopping Assistant (chat widget)
- ✨ AI Product Description Generator
- 🎯 Smart Product Recommendations

## 📁 Project Structure

ShopEase/
├── backend/
│   ├── config/          # DB + Cloudinary setup
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth + Admin + Error
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   └── src/
│       ├── api/         # Axios config
│       ├── components/  # Reusable UI
│       ├── context/     # Global state
│       ├── pages/       # All pages
│       └── App.jsx      # Router setup
└── README.md

## 🛠️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Razorpay account

### Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
CLAUDE_API_KEY=your_claude_key
```

```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

```bash
npm run dev
```

### Seed Sample Products
```bash
cd backend
node utils/seedProducts.js
```

## 📸 Screenshots

### Home Page
![Home](https://via.placeholder.com/800x400?text=ShopEase+Home)

### Admin Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

### AI Chat Assistant
![AI Chat](https://via.placeholder.com/800x400?text=AI+Assistant)

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/products | Get all products |
| POST | /api/products | Add product (Admin) |
| POST | /api/cart | Add to cart |
| POST | /api/orders | Place order |
| POST | /api/payment/create-order | Create Razorpay order |
| POST | /api/ai/search | AI product search |

## 🎓 What I Learned

- Full Stack MERN development
- JWT authentication with HTTP-only cookies
- Payment gateway integration (Razorpay)
- Cloud storage (Cloudinary)
- AI API integration (Claude)
- MongoDB aggregation pipeline
- React Context API for state management
- Deployment on Vercel + Render

## 👨‍💻 Developer

**Rahul Dudharejiya**
- GitHub: [@rahul-dudhrejiya](https://github.com/rahul-dudhrejiya)

---

⭐ Star this repo if you found it helpful!