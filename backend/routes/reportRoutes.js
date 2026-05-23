const express = require("express")
const {protect, adminOnly} = require("../middlewares/authMiddleware.js")
const {exportTasksReport, exportUsersReport} = require("../controllers/reportController.js")
const router = express.Router()

router.get("/export/tasks", protect, adminOnly, exportTasksReport) // Export all task as Excel/PDF
router.get("/export/users", protect, adminOnly, exportUsersReport) // Export user-task report

module.exports = router