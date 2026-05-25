const express = require("express");

const Project = require("../models/project");

const User = require("../models/user");

const isAuthenticated = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


router.post(

  "/create",

  isAuthenticated,

  authorizeRoles("Admin"),

  async (req, res) => {

    try {

      const { name, description } = req.body;

      const project = await Project.create({

        name,

        description,

        admin: req.user._id,

        members: [req.user._id]

      });

      res.status(201).json({

        message: "Project created",

        project

      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);



router.get(

  "/my-projects",

  isAuthenticated,

  async (req, res) => {

    try {

      const projects = await Project.find({

        members: req.user._id

      })

      .populate("admin", "name email")

      .populate("members", "name email");

      res.json(projects);

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);


router.post(

  "/add-member/:projectId",

  isAuthenticated,

  authorizeRoles("Admin"),

  async (req, res) => {

    try {

      const { email } = req.body;

      const project = await Project.findById(
        req.params.projectId
      );

      if (!project) {

        return res.status(404).json({
          message: "Project not found"
        });

      }

      // only project admin
      if (
        project.admin.toString() !==
        req.user._id.toString()
      ) {

        return res.status(403).json({
          message: "Only project admin can add members"
        });

      }

      const user = await User.findOne({ email });

      if (!user) {

        return res.status(404).json({
          message: "User not found"
        });

      }

      // already member
      if (
        project.members.includes(user._id)
      ) {

        return res.status(400).json({
          message: "User already member"
        });

      }

      project.members.push(user._id);

      await project.save();

      res.json({
        message: "Member added",
        project
      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);



router.delete(

  "/remove-member/:projectId/:userId",

  isAuthenticated,

  authorizeRoles("Admin"),

  async (req, res) => {

    try {

      const project = await Project.findById(
        req.params.projectId
      );

      if (!project) {

        return res.status(404).json({
          message: "Project not found"
        });

      }

      // only admin
      if (
        project.admin.toString() !==
        req.user._id.toString()
      ) {

        return res.status(403).json({
          message: "Only admin can remove members"
        });

      }

      project.members =
        project.members.filter(
          member =>
            member.toString() !==
            req.params.userId
        );

      await project.save();

      res.json({
        message: "Member removed"
      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);


module.exports = router;