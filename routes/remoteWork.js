import express from "express";
import {
  createRemoteWorkRequest,
  getMyRemoteWorkRequests,
  getAllRemoteWorkRequests,
  approveRemoteWork,
  rejectRemoteWork,
} from "../controllers/remoteWorkController.js";
import adminOnly from "../middlewares/adminMiddleware.js";
import verifyToken from "../middlewares/authMiddleware.js"; 

const router = express.Router();

router.post("/", verifyToken, createRemoteWorkRequest);  
router.get("/me", verifyToken, getMyRemoteWorkRequests);  
router.get("/", verifyToken, adminOnly, getAllRemoteWorkRequests);  
router.put("/:id/approve", verifyToken, adminOnly, approveRemoteWork);  
router.put("/:id/reject", verifyToken, adminOnly, rejectRemoteWork);  

export default router;
