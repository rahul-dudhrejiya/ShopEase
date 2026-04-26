# 🛒 ShopEase — Shopping Made Easy!

A full-stack E-Commerce application built with the MERN stack,
featuring AI-powered product search, Razorpay payments,
and a complete admin dashboard.

![ShopEase Banner](https://raw.githubusercontent.com/rahul-dudhrejiya/ShopEase/main/screenshots/home.jpg)

## 🌐 Live Demo

| Platform | URL |
|---|---|
| 🌐 Frontend | https://shop-ease-ten.vercel.app |
| ⚙️ Backend API | https://shopease-backend-8brj.onrender.com |

## 🔐 Test Credentials

| Role | Email | Password |
|---|---|---|
| 👑 Admin | admin@shopease.com | admin123 |
| 👤 Customer | rahul@shopease.com | rahul123 |

## 🚀 Tech Stack

### Frontend
- ⚛️ React.js + Vite
- 🎨 Tailwind CSS v4
- 🔄 React Router DOM
- 🌐 Context API (Auth + Cart + Theme)
- 📡 Axios
- 📊 Recharts
- 🔔 React Hot Toast
- 🎯 Lucide React Icons

### Backend
- 🟢 Node.js + Express.js
- 🍃 MongoDB + Mongoose
- 🔐 JWT Authentication
- 🔒 Bcrypt Password Hashing
- ☁️ Multer + Cloudinary
- 💳 Razorpay Payment
- 📧 Nodemailer
- 🤖 Claude AI API

### Deployment
- 🔺 Frontend → Vercel
- 🟦 Backend → Render
- 🍃 Database → MongoDB Atlas
- ☁️ Images → Cloudinary

## ✨ Features

### 👤 Customer Features
- ✅ Register/Login with JWT (HTTP-only cookies)
- ✅ Browse products with search + filter + pagination
- ✅ Debounced search (500ms delay)
- ✅ Product detail with image gallery + reviews
- ✅ Add to cart + update quantity + remove
- ✅ Apply coupon codes at checkout
- ✅ Razorpay online payment integration
- ✅ Order history with status tracking
- ✅ Cancel orders
- ✅ Product reviews and star ratings
- ✅ Wishlist (save products for later)
- ✅ User profile management
- ✅ Dark/Light mode toggle
- ✅ Fully responsive mobile design

### 👑 Admin Features
- ✅ Secure admin-only routes
- ✅ Total revenue, orders, users, products stats
- ✅ Monthly sales charts (Recharts)
- ✅ Low stock alerts
- ✅ Add/Delete products
- ✅ Manage all orders + update status
- ✅ Ban/Unban users

### 🤖 AI Features (Claude AI)
- ✅ AI Shopping Assistant (chat widget)
- ✅ AI Product Description Generator
- ✅ Smart Product Recommendations

## 📸 Screenshots

### 🏠 Home Page
![Home Page](https://raw.githubusercontent.com/rahul-dudhrejiya/ShopEase/main/screenshots/home.jpg)

### 📦 Products Page
![Products](https://raw.githubusercontent.com/rahul-dudhrejiya/ShopEase/main/screenshots/products.jpg)

### 📊 Admin Dashboard
![Dashboard](https://raw.githubusercontent.com/rahul-dudhrejiya/ShopEase/main/screenshots/dashboard.jpg)

### 🤖 AI Chat Assistant
![AI Chat](https://raw.githubusercontent.com/rahul-dudhrejiya/ShopEase/main/screenshots/ai-chat.jpg)

## 📁 Project Structure

```
ShopEase/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   ├── wishlistController.js
│   │   ├── couponController.js
│   │   ├── adminController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Review.js
│   │   ├── Wishlist.js
│   │   └── Coupon.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── adminRoutes.js
│   │   └── aiRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendEmail.js
│   │   ├── apiFeatures.js
│   │   └── seedProducts.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       │   └── axios.js
│       ├── components/
│       │   └── common/
│       │       ├── Navbar.jsx
│       │       ├── ProductCard.jsx
│       │       ├── ProtectedRoute.jsx
│       │       └── AIChatWidget.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   └── ThemeContext.jsx
│       ├── pages/
│       │   ├── customer/
│       │   │   ├── Home.jsx
│       │   │   ├── Products.jsx
│       │   │   ├── ProductDetail.jsx
│       │   │   ├── Cart.jsx
│       │   │   ├── Checkout.jsx
│       │   │   ├── Orders.jsx
│       │   │   ├── Wishlist.jsx
│       │   │   ├── Profile.jsx
│       │   │   ├── Login.jsx
│       │   │   └── Register.jsx
│       │   └── admin/
│       │       ├── Dashboard.jsx
│       │       ├── AddProduct.jsx
│       │       └── ManageProducts.jsx
│       └── App.jsx
└── README.md
```

## 🛠️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Razorpay account
- Claude AI API key

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

### Add Sample Products

```bash
cd backend
node utils/seedProducts.js
```

## 🔗 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/products | Get all products | Public |
| POST | /api/products | Add product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |
| POST | /api/cart | Add to cart | Private |
| GET | /api/cart | Get cart | Private |
| POST | /api/orders | Place order | Private |
| GET | /api/orders/my | Get my orders | Private |
| POST | /api/payment/create-order | Create payment | Private |
| POST | /api/payment/verify | Verify payment | Private |
| POST | /api/reviews/:productId | Add review | Private |
| POST | /api/wishlist/:productId | Toggle wishlist | Private |
| POST | /api/coupons/apply | Apply coupon | Private |
| GET | /api/admin/stats | Dashboard stats | Admin |
| POST | /api/ai/search | AI product search | Public |
| POST | /api/ai/generate-description | AI description | Admin |

## 🎓 Key Learnings

- Full Stack MERN development
- JWT authentication with HTTP-only cookies
- Cross-domain cookie handling (sameSite: none)
- Payment gateway integration (Razorpay)
- Cloud storage with Cloudinary
- AI API integration (Claude)
- MongoDB aggregation pipeline for analytics
- React Context API for global state
- Debouncing for search optimization
- Deployment on Vercel + Render

## 👨‍💻 Developer

**Rahul Dudharejiya**

[![GitHub](https://img.shields.io/badge/GitHub-rahul--dudhrejiya-black?style=flat&logo=github)](https://github.com/rahul-dudhrejiya)

---

⭐ **Star this repo if you found it helpful!**