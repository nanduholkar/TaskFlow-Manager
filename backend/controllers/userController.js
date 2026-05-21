const Task = require('../models/Task');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users 

const getUsers = async (req, res) => {
    try{
        const user = await User.find({role: "member"}).select("-password")
            // Add task counts to each user
            const userWithTaskCounts = await Promise.all(user.map(async (user) => {
                const pendingTasks = await Task.countDocuments({assignedTo: user._id, status: "Pending"})
                const inProgressTasks = await Task.countDocuments({assignedTo: user._id, status: "In progress"})
                const completedTasks = await Task.countDocuments({assignedTo: user._id, status: "Completed"})
                
                return {
                    ...user._doc, // Incluede all existing user data
                    pendingTasks,
                    inProgressTasks,
                    completedTasks
                }
            }))
        res.status(200).json(userWithTaskCounts)

    }catch(error){
        res.status(500).json({message: "Server error", error: error.message})
    }
}
const getUserById = async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select("-password")
        res.status(200).json(user)

    }catch(error){
        res.status(500).json({message: "Server error", error: error.message})
    }
}

module.exports = {getUsers, getUserById}