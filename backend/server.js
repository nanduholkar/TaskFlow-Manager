require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path")

const connectDB = require("./config/db.js")

const app = express()

const authRoutes = require("./routes/authRoutes.js")
const userRoutes = require("./routes/userRoutes.js")
const taskRoutes = require("./routes/taskRoutes.js")
const reportRoutes = require("./routes/reportRoutes.js")



// Middleware to handel CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)

//middleware
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

//connect to database
connectDB()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/report", reportRoutes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Start Server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`server running on port ${PORT}`))

