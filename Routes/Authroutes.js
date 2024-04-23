const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.use(bodyParser.json());
router.use(express.json());

const JWT_SECRET =
  "jsfhskjfhkfskhfh()ayikfjdpo.02243243252313133543[]]sdfijsjd";

require("../Schemas/UserDetails");

const User = mongoose.model("UserInfo");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//User Registration
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if password is provided
  if (!password || !username || !email) {
    return res.status(400).send({ status: "error", data: "fill the fields" });
  }
  // Check if email is valid
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .send({ status: "error", data: "Invalid email address" });
  }

  try {
    const oldUser = await User.findOne({ email: email });

    if (oldUser) {
      return res
        .status(409)
        .send({ status: "error", data: "User already exists" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username: username,
      email: email,
      password: encryptedPassword,
    });

    res.status(201).send({ status: "ok", data: "User Created" });
  } catch (error) {
    console.error("Error occurred during registration:", error);
    res.status(500).send({ status: "error", data: "Internal server error" });
  }
});

//UserLogin

router.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  // Check if email is valid
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .send({ status: "error", data: "Invalid email address" });
  }
  try {
    const oldUser = await User.findOne({ email: email });

    if (!oldUser) {
      return res
        .status(404)
        .send({ status: "error", data: "User doesn't exist" });
    }

    if (!password || !oldUser.password) {
      return res
        .status(400)
        .send({ status: "error", data: "Invalid password or user data" });
    }

    const isPasswordValid = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ status: "error", data: "Invalid password" });
    }

    const token = jwt.sign({ username: oldUser.username,emai:oldUser.email }, JWT_SECRET);

    res.status(200).send({ status: "ok", data: "Success", msg: token });
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).send({ status: "error", data: "Internal server error" });
  }
});

//Forgot  Password

router.post("/forgotpass", async (req, res) => {
  try {
    const { email } = req.body;
    // Check if email is valid
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .send({ status: "error", data: "Invalid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetPasswordOTP = otp;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "foodlabapp34@gmail.com",
        pass: "xegt cyuq veae hwvf",
      },
    });

    const mailOptions = {
      from: "foodlabapp34@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      html: `
                  <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
                      <h2 style="color: #333; font-weight: bold;">Password Reset OTP</h2>
                      <p style="font-size: 16px; color: #555;">Dear User,</p>
                      <p style="font-size: 16px; color: #555;">Your OTP for password reset is: <span style="color: #FFA500; font-weight: bold;">${otp}</span></p>
                      <p style="font-size: 14px; color: #777;">Please use this OTP to reset your password.</p>
                      <p style="font-size: 14px; color: #777;">If you did not request a password reset, please ignore this email.</p>
                  </div>
              `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to your email for password reset" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Reset Password

router.post("/resetpass", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    // Check if email is valid
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .send({ status: "error", data: "Invalid email address" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    if (user.resetPasswordOTP != otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    user.password = encryptedPassword;
    user.resetPasswordOTP = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Unique user details
router.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const useremail = user.email;
    const username = user.username;

    User.findOne({ email: useremail }).then((data) => {
      return res.send({ status: "ok", data: username,useremail });
    });
  } catch (err) {
    return res.send({ status: "error" });
  }
});

module.exports = router;
