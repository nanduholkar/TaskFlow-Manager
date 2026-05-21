const express = require("express")

const router = express.Router()

const { getUsers, getUserById, deleteUser } = require("../controllers/userController")
const { protect, adminOnly } = require("../middlewares/authMiddleware") 


// User management routes
router.get("/",protect, adminOnly, getUsers)
router.get("/:id", protect, getUserById);

module.exports = router