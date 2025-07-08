import LeaveRequest from "../models/LeaveRequest.js";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";

import dotenv from "dotenv";

dotenv.config();

export const createLeaveRequest = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hireDate = new Date(user.hireDate);
    const currentDate = new Date();
    const monthsEmployed = (currentDate.getFullYear() - hireDate.getFullYear()) * 12 + currentDate.getMonth() - hireDate.getMonth();

    if (monthsEmployed < 3) {
      return res.status(403).json({ message: "You must be employed for at least 3 months to request leave" });
    }

    let leaveBalance = user.leaveBalance[leaveType];

    const numberOfDays =
      (new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24) + 1;
    if (leaveBalance < numberOfDays) {
      return res.status(400).json({ message: "Insufficient leave balance" });
    }

    const leaveRequest = new LeaveRequest({
      userId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "pending",
    });

    await leaveRequest.save();
    await leaveRequest.populate('userId', 'name email');


    const adminEmail = "salmaghanem146@gmail.com";    
    sendEmail(
      adminEmail,
      "New Leave Request",
      `A new leave request has been submitted by ${user.name} from ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}.`
    );

    const userMessageBody = `
      Dear ${user.name},

      Your leave request from ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}
      has been successfully submitted.

      📝 Reason: ${reason || "No reason provided."}

      Best regards,
      HR Salma Ghanem
    `;
    sendEmail(user.email, "Leave Request Submitted", userMessageBody);

    res
      .status(201)
      .json({ message: "Leave request created successfully", leaveRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getMyLeaveRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const leaveRequests = await LeaveRequest.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateLeaveRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminComment } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const user = await User.findById(leaveRequest.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedStatus = status.toLowerCase();

    if (
      !["approve", "approved", "reject", "rejected"].includes(normalizedStatus)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const finalStatus = normalizedStatus.startsWith("approve")
      ? "approved"
      : "rejected";

    if (finalStatus === "approved" && leaveRequest.status !== "approved") {
      const leaveType = leaveRequest.leaveType;
      const numberOfDays =
        (new Date(leaveRequest.endDate) - new Date(leaveRequest.startDate)) /
          (1000 * 3600 * 24) +
        1;

      if (user.leaveBalance[leaveType] < numberOfDays) {
        return res
          .status(400)
          .json({ message: "User has insufficient leave balance" });
      }

      user.leaveBalance[leaveType] -= numberOfDays;
      await user.save();
    }

    leaveRequest.status = finalStatus;
    leaveRequest.adminComment = adminComment || "";
    await leaveRequest.save();

    const emailStatusText = finalStatus === "approved" ? "✅ Approved" : "❌ Rejected";
    const messageBody = `
    Dear ${user.name},
    
    Your leave request from ${new Date(leaveRequest.startDate).toDateString()} to ${new Date(leaveRequest.endDate).toDateString()} has been ${finalStatus.toUpperCase()}.
    
    📝 HR Comment: ${adminComment || "No comment provided."}
    
    Status: ${emailStatusText}
    
    Best regards,
    HR Salma Ghanem
    `;
    
    sendEmail(user.email, "Leave Request Status Update", messageBody);

    res
      .status(200)
      .json({ message: "Leave request status updated", leaveRequest });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message || error });
  }
};
