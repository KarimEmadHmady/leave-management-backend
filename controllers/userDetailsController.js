// controllers/userDetailsController.js
import User from "../models/User.js";

export const updateUserDetails = async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  try {
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


// controllers/userDetailsController.js

export const createUserByAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      const user = new User(req.body);
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
  
  