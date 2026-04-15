import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables FIRST before anything else
// WHY: All other code may need env variables (like DB URI), so load them first
dotenv.config();

// Connect to MongoDB
// WHY here: Before starting the server, make sure DB is ready
connectDB();

// Initialize Express app
// WHY: express() creates an application object — this IS our server
const app = express();

// MIDDLEWARE SETUP
// WHAT is middleware? Code that runs BETWEEN receiving a request and sending a response

// 1. CORS Middleware
// WHY: By default, browsers BLOCK requests from one origin (localhost:5173) to another (localhost:5000)
// This is a browser security feature called Same-Origin Policy
// cors() says "I trust requests from FRONTEND_URL, let them through"
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,  // WHY: Allows cookies to be sent with requests
}));

// 2. JSON Body Parser
// WHY: When frontend sends data (like login form), it sends JSON
// Without this, req.body would be undefined — Express can't read the request body
app.use(express.json());

// 3. URL-Encoded Body Parser
// WHY: Some forms send data as URL-encoded format (key=value&key2=value2)
// extended: true allows nested objects
app.use(express.urlencoded({ extended: true }))

// 4. Cookie Parser
// WHY: We store JWT in HTTP-only cookies for security
// Without this, req.cookies would be undefined
app.use(cookieParser());

// ROUTES

// We'll uncomment these as we build each feature:
// import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);
// This means: any request to /api/auth/... goes to authRoutes


// ROOT ROUTE (for testing)
app.get('/', (req, res) => {
    res.json({
        message: '🛒 ShopEase API is running!',
        tagline: 'Shopping Made Easy!'
    });
});

// ERROR MIDDLEWARE
// WHY at the END: Error middleware must be registered AFTER all routes
// If any route throws an error, it "falls through" to this handler
// We'll build this in detail later
app.use(errorHandler);

// START SERVER
// process.env.PORT — on Render, they assign a PORT automatically
// || 5000 — fallback for local development
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});