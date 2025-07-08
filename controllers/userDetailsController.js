import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const updateUserDetails = async (req, res) => {
  const userId = req.params.id;
  const updates = { ...req.body };

  try {
    // Fetch the target user to check their role
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the target user is admin, only allow self-edit
    if (targetUser.role === "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Admins can only edit their own account" });
    }

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    if (updates.employeeStatus === "resigned") {
      if (!updates.resignationReason) {
        return res.status(400).json({ message: "Resignation reason is required" });
      }
      if (!updates.resignationDate) {
        return res.status(400).json({ message: "Resignation date is required" });
      }
    }

    if (updates.employeeStatus === "active") {
      updates.resignationReason = null;
      updates.resignationDate = null;
    }

    if (!req.body.hasOwnProperty("employeeStatus")) {
      delete updates.employeeStatus;
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const createUserByAdmin = async (req, res) => {
  try {
    const { email, password, employeeStatus, resignationReason } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (employeeStatus === "resigned" && !resignationReason) {
      return res.status(400).json({ message: "Resignation reason is required" });
    }

    if (employeeStatus === "active") {
      req.body.resignationReason = null;
    }

    delete req.body.employeeStatus;   

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
