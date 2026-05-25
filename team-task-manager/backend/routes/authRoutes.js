const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Signup successful",
      user: newUser
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});
router.post("/login", (req, res, next) => {

  passport.authenticate("local", (err, user, info) => {

    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        message: info.message
      });
    }

    req.login(user, (err) => {

      if (err) {
        return next(err);
      }

      return res.json({
        message: "Login successful",
        user
      });

    });

  })(req, res, next);

});


router.get("/logout", (req, res) => {

  req.logout(() => {

    res.json({
      message: "Logout successful"
    });

  });

});


router.get("/me", (req, res) => {

  if (!req.user) {

    return res.status(401).json({
      message: "Not logged in"
    });

  }

  res.json(req.user);

});


module.exports = router;