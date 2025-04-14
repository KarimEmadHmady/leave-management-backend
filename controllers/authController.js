import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { resetLeaveBalanceIfNeeded } from "../services/leaveService.js";
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, hireDate } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, hireDate });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hireDate: user.hireDate,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    await resetLeaveBalanceIfNeeded(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hireDate: user.hireDate,
      leaveBalance: user.leaveBalance,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
