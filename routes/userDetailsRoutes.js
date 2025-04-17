import express from "express";
import {
  updateUserDetails,
  deleteUser,
  getAllUsers,
  getUserById,
  createUserByAdmin,
} from "../controllers/userDetailsController.js";
import verifyToken from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js"

const router = express.Router();

router.put("/:id", verifyToken, adminOnly, updateUserDetails);
router.delete("/:id", verifyToken, adminOnly, deleteUser);
router.get("/", verifyToken, adminOnly, getAllUsers);
router.get("/:id", verifyToken, adminOnly, getUserById);
router.post("/", verifyToken, adminOnly, createUserByAdmin);


router.post(
  "/upload/:id",
  verifyToken,
  adminOnly,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      user.profileImage = req.file.path;
      await user.save();

      res.status(200).json({
        message: "Profile image uploaded successfully",
        profileImage: user.profileImage,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Error uploading image", error: err.message });
    }
  }
);



export default router;
