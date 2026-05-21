const express = require("express")
const {protect, adminOnly} = require("../middlewares/authMiddleware")
const router = express.Router()
const {getDashboardData, updateTask, getUserDashBoardData, getTasks, getTaskById, createTask, deleteTask, updateTaskStatus, updateTaskChecklist} = require("../controllers/taskController")

// Task Management Routes 

router.get("/dashboard-data", protect, getDashboardData)
router.get("/user-dashboard-data", protect, getUserDashBoardData);
router.get("/", protect, getTasks)
router.get("/:id", protect, getTaskById);
router.post("/", protect, adminOnly, createTask);
router.put("/:id", protect, updateTask)
router.delete("/:id", protect, adminOnly, deleteTask)
router.put("/:id/status", protect, updateTaskStatus)
router.put("/:id/todo", protect, updateTaskChecklist )

module.exports = router;

