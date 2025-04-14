import express from "express";
import {
    createLeaveRequest,
    getMyLeaveRequests,
    getAllLeaveRequests,
    updateLeaveRequestStatus,
} from "../controllers/leaveController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createLeaveRequest);

router.get("/me", verifyToken, getMyLeaveRequests);

router.get("/", verifyToken, getAllLeaveRequests);

router.put("/:id", verifyToken, updateLeaveRequestStatus);

export default router;
