const express = require("express");

const Task = require("../models/Task");

const Project = require("../models/Project");

const isAuthenticated = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


router.post(

  "/create/:projectId",

  isAuthenticated,

  authorizeRoles("Admin"),

  async (req, res) => {

    try {

      const {

        title,
        description,
        dueDate,
        priority,
        assignedTo

      } = req.body;

      const project = await Project.findById(
        req.params.projectId
      );

      if (!project) {

        return res.status(404).json({
          message: "Project not found"
        });

      }

      const task = await Task.create({

        title,
        description,
        dueDate,
        priority,

        assignedTo,

        project: project._id,

        createdBy: req.user._id

      });

      res.status(201).json({

        message: "Task created",

        task

      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);


router.get(

  "/project/:projectId",

  isAuthenticated,

  async (req, res) => {

    try {

      const tasks = await Task.find({

        project: req.params.projectId

      })

      .populate("assignedTo", "name email")

      .populate("createdBy", "name");

      res.json(tasks);

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);



router.put(

  "/update-status/:taskId",

  isAuthenticated,

  async (req, res) => {

    try {

      const { status } = req.body;

      const task = await Task.findById(
        req.params.taskId
      );

      if (!task) {

        return res.status(404).json({
          message: "Task not found"
        });

      }

      // only assigned user
      if (
        task.assignedTo.toString() !==
        req.user._id.toString()
      ) {

        return res.status(403).json({
          message:
            "Only assigned user can update task"
        });

      }

      task.status = status;

      await task.save();

      res.json({

        message: "Task updated",

        task

      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);

router.delete(

  "/delete/:taskId",

  isAuthenticated,

  authorizeRoles("Admin"),

  async (req, res) => {

    try {

      const task = await Task.findByIdAndDelete(
        req.params.taskId
      );

      if (!task) {

        return res.status(404).json({
          message: "Task not found"
        });

      }

      res.json({
        message: "Task deleted"
      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);

module.exports = router;