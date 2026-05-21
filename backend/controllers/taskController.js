const Task = require("../models/Task.js")
const User = require("../models/User.js")

const getTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) filter.status = status;

    const baseFilter =
      req.user.role === "admin"
        ? { ...filter }
        : { ...filter, assignedTo: req.user._id };

    const tasks = await Task.find(baseFilter)
      .populate("assignedTo", "name email profileImageUrl")
      .sort({ createdAt: -1 });

    const enrichedTasks = tasks.map(task => {
      const completedCount = task.todoChecklist.filter(
        item => item.completed
      ).length;

      return {
        ...task._doc,
        completedTodoCount: completedCount
      };
    });

    const [allTasks, pendingTasks, inProgressTasks, completedTasks] =
      await Promise.all([
        Task.countDocuments(baseFilter),
        Task.countDocuments({ ...baseFilter, status: "pending" }),
        Task.countDocuments({ ...baseFilter, status: "in-progress" }),
        Task.countDocuments({ ...baseFilter, status: "completed" })
      ]);

    return res.status(200).json({
      tasks: enrichedTasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message
    });
  }
};
const getTaskById = async(req, res,) => {
    try{
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )
        if(!task) return res.status(404).json({message: "Task not found "})

        res.status(200).json(task)
    }
    catch(error){
        res.status(500).json({message: "server error", error: error.message})
    }
}
const createTask = async(req, res,) => {
    try{
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachment,
            todoChecklist
        } = req.body

        if(!Array.isArray(assignedTo)){
            return res
              .status(400)
              .json({message: "AssignedTo must be an array of user IDs "})
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoChecklist,
            attachment
        })

        res.status(200).json({message: "Task created Successfully", task})

        

    }
    catch(error){
        res.status(500).json({message: "server error", error: error.message})
    }
}
const updateTask = async(req, res,) => {
    try{
        const task = await Task.findById(req.params.id)
        if(!task) return res.status(404).json({message: "Task not found"})
        
        task.title = req.body.title || task.title
        task.description = req.body.description || task.description
        task.priority = req.body.priority || task.priority
        task.status = req.body.status || task.status
        task.dueDate = req.body.dueDate || task.dueDate
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist
        task.attachment = req.body.attachment || task.attachment

        if (req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)){
                return res
                  .status(400)
                  .json({message: "Assigned to must be an array of user ID's" })
            }
            task.assignedTo = req.body.assignedTo
        }
        const updatedTask = await task.save()
        res.json({message: "Task updated Successfully", updatedTask})
    }
    catch(error){
        res.status(500).json({message: "server error", error: error.message})
    }
}
const updateTaskStatus = async(req, res,) => {
    try{
        const task = await Task.findById(req.params.id)
        if(!task) return res.status(404).json({message: "Task not found"});

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        )

        if(!isAssigned && req.user.role != "admin"){
            return res.status(403).json({message: "Not authorised"})
        }

        task.status = req.body.status || task.status

        if(task.status === "completed"){
            task.todoChecklist.forEach((item) => (item.completed = true))
            task.Progress = 100
        }
        await task.save()
        res.status(200).json({message: "Task status updated", task})
    }
    catch(error){
        res.status(500).json({message: "server error", error: error.message})
    }
}
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔐 Authorization check (admin OR assigned user only)
    const isAssigned = task.assignedTo.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to delete this task",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Task deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

const updateTaskChecklist = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔐 Authorization check (admin OR assigned user only)
    const isAssigned = task.assignedTo.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to update checklist",
      });
    }

    // ✅ Update checklist
    if (req.body.todoChecklist) {
      task.todoChecklist = req.body.todoChecklist;
    }

    // 📊 Progress calculation
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;

    const totalItems = task.todoChecklist.length;

    task.Progress =
      totalItems > 0
        ? Math.round((completedCount / totalItems) * 100)
        : 0;

    // 🔄 Auto status update based on progress
    if (task.Progress === 100) {
      task.status = "completed";
    } else if (task.Progress > 0) {
      task.status = "in-progress";
    } else {
      task.status = "pending";
    }

    await task.save();

    // 👇 Return updated task safely
    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    return res.status(200).json({
      message: "Task checklist updated successfully",
      task: updatedTask,
    });

  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};
const getDashboardData = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "pending" });
    const completedTasks = await Task.countDocuments({ status: "completed" });

    const overdueTasks = await Task.countDocuments({
      status: { $ne: "completed" },
      dueDate: { $lt: new Date() },
    });

    // 📊 STATUS DISTRIBUTION
    const taskStatuses = ["pending", "in-progress", "completed"];

    const taskDistributionRaw = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "_").toLowerCase();

      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;

      return acc;
    }, {});

    taskDistribution.all = totalTasks;

    // 📊 PRIORITY DISTRIBUTION
    const taskPriorities = ["Low", "Medium", "High"];

    const taskPriorityLevelsRaw = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority.toLowerCase()] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;

      return acc;
    }, {});

    // 🆕 RECENT TASKS
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    return res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};
const getUserDashBoardData = async(req, res,) => {
    try{
        const userId = req.user._id
        const totalTasks = await Task.countDocuments({assignedTo: userId})
        const pendingTasks = await Task.countDocuments({assignedTo: userId, status: "pending"})
        const completedTasks = await Task.countDocuments({assignedTo: userId, status: "completed"})
        const overdueTasks = await Task.countDocuments({assignedTo: userId, status: {$ne: "completed"}, dueDate: {$lt: new Date()}})

        const taskStatuses = ["pending", "in-progress", "completed"]
        const taskDistributionRaw = await Task.aggregate([
            {$match: {assignedTo: { $in: [userId] }}},
            {$group: {_id: "$status", count: {$sum: 1}}}
        ])
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "_").toLowerCase()
            acc[formattedKey] = taskDistributionRaw.find(item => item._id === status)?.count || 0
            return acc
        }, {})
        taskDistribution.all = totalTasks

        const taskPriorities = ["Low", "Medium", "High"]
        const taskPriorityLevelsRaw = await Task.aggregate([
            {$match: {assignedTo: userId}},
            {$group: {_id: "$priority", count: {$sum: 1}}}
        ])

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority]= taskPriorityLevelsRaw.find(item => item._id === priority)?.count || 0
            return acc
        }, {})

        const recentTasks = await Task.find({assignedTo: userId}).sort({createdAt: -1}).limit(10).select("title status priority dueDate createdAt")

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks
        })
    }
    catch(error){
        res.status(500).json({message: "server error", error: error.message})
    }
}

module.exports = {getDashboardData, getUserDashBoardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist}