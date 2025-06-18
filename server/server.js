const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const cron = require('node-cron');
const { initCronTasks } = require('./cron-tasks');


dotenv.config()

const connectdatabase = require('./database/database')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}))

connectdatabase()

const authRoutes = require("./routes/auth-routes")
const userRoutes = require("./routes/user-routes")
const foodItemRoutes = require("./routes/food-routes")
const swapRoutes = require("./routes/swap-routes")
const donationRoutes = require("./routes/donation-routes")
const paymentRouter = require('./routes/payment-routes')
app.use('/api/pay' ,paymentRouter)


app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/food-items", foodItemRoutes)
app.use("/api/swaps", swapRoutes)
app.use("/api/donations", donationRoutes)


app.use('/uploads', express.static('uploads'));


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"))
  })
}


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  })
})


initCronTasks();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

