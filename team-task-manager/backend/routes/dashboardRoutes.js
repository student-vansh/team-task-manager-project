const express = require("express");

const Task = require("../models/task");

const isAuthenticated = require("../middleware/authMiddleware");

const router = express.Router();


router.get(

  "/dashboard",

  isAuthenticated,

  async (req, res) => {

    try {

      // total tasks
      const totalTasks = await Task.countDocuments();

      // completed
      const completedTasks =
        await Task.countDocuments({
          status: "Done"
        });

      // pending
      const pendingTasks =
        await Task.countDocuments({
          status: {
            $ne: "Done"
          }
        });

      // overdue
      const overdueTasks =
        await Task.countDocuments({

          dueDate: {
            $lt: new Date()
          },

          status: {
            $ne: "Done"
          }

        });

      // status grouping
      const tasksByStatus =
        await Task.aggregate([

          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }

        ]);

      res.json({

        totalTasks,

        completedTasks,

        pendingTasks,

        overdueTasks,

        tasksByStatus

      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);


module.exports = router;