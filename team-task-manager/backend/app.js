require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const isAuthenticated = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes =require("./routes/dashboardRoutes");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");

const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");

const app = express();

connectDB();

require("./passport/passportConfig");

app.set("trust proxy", 1);

app.use(express.json());

app.get(

  "/admin",

  isAuthenticated,

  authorizeRoles("Admin"),

  (req, res) => {

    res.json({
      message: "Admin Route"
    });

  }

);

const frontendUrl = process.env.FRONTEND_URL || "https://team-task-manager-project-frontend.onrender.com";
const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    },
  }),
);



app.use(passport.initialize());

app.use(passport.session());


app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/dashboard", isAuthenticated, (req, res) => {

  res.json({
    message: "Welcome to dashboard",
    user: req.user
  });

});
app.listen(process.env.PORT, () => {
  console.log("Server Running");
});