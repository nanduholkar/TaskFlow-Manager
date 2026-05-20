require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path")

const connectDB = require("./config/db.js")

const app = express()


// import authRoutes from "./routes/authRoutes.js"
// import reportRoutes from "./routes/reportRoutes.js"
// import taskRoutes from "./routes/taskRoutes.js"
// import userRoutes from "./routes/userRoutes.js"

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

//connect to database
connectDB()

// Routes
// app.use("/api/auth", authRoutes)
// app.use("/api/report", reportRoutes)
// app.use("/api/task", taskRoutes)
// app.use("/api/user", userRoutes)

// Start Server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`server running on port ${PORT}`))

