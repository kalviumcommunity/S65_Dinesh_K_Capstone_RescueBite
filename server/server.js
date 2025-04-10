const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const cron = require('node-cron');
const { initCronTasks } = require('./cron-tasks');

// Load environment variables
dotenv.config()

// Import database connection
const connectdatabase = require('./database/database')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}))

// Connect to MongoDB
connectdatabase()

// Import routes
const authRoutes = require("./routes/auth-routes")
const userRoutes = require("./routes/user-routes")
const foodItemRoutes = require("./routes/food-routes")
const swapRoutes = require("./routes/swap-routes")
const donationRoutes = require("./routes/donation-routes")
const paymentRouter = require('./routes/payment-routes')
app.use('/api/pay' ,paymentRouter)

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/food-items", foodItemRoutes)
app.use("/api/swaps", swapRoutes)
app.use("/api/donations", donationRoutes)

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  })
})

// Initialize cron tasks before starting server
initCronTasks();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

