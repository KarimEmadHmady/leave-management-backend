import RemoteWorkRequest from "../models/RemoteWorkRequest.js";
import { sendEmail } from "../services/emailService.js";

export const createRemoteWorkRequest = async (req, res) => {
  const { date, reason } = req.body;

  try {
    const newRequest = await RemoteWorkRequest.create({
      userId: req.user.id,
      date,
      reason,
    });

    await newRequest.populate('userId', 'name email');


    const adminEmail = "karimemad2066@gmail.com";      
    sendEmail(
      adminEmail,
      "New Remote Work Request",
      `A new remote work request has been submitted by ${req.user.name} for the date ${new Date(date).toDateString()}.`
    );

    const messageBody = `
      Dear ${req.user.name},

      Your remote work request for ${new Date(date).toDateString()} has been successfully submitted. 

      📝 Reason: ${reason || "No reason provided."}

      Best regards,
      HR Salma Ghanem
    `;

    sendEmail(req.user.email, "Remote Work Request Submitted", messageBody);

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyRemoteWorkRequests = async (req, res) => {
  const requests = await RemoteWorkRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(requests);
};

export const getAllRemoteWorkRequests = async (req, res) => {
  const requests = await RemoteWorkRequest.find().populate("userId", "name email").sort({ createdAt: -1 });
  res.json(requests);
};

export const approveRemoteWork = async (req, res) => {
  const request = await RemoteWorkRequest.findById(req.params.id).populate("userId");
  if (!request) return res.status(404).json({ message: "Not found" });

  request.status = "approved";
  request.adminComment = req.body.comment || "";
  await request.save();

  const emailStatusText = "✅ Approved";
  const messageBody = `
    Dear ${request.userId.name},

    Your remote work request for ${new Date(request.date).toDateString()} has been APPROVED.

    📝 HR Comment: ${request.adminComment || "No comment provided."}

    Status: ${emailStatusText}

    Best regards,  
    HR Salma Ghanem
  `;
  sendEmail(request.userId.email, "Remote Work Request Status Update", messageBody);

  res.json(request);
};

export const rejectRemoteWork = async (req, res) => {
  const request = await RemoteWorkRequest.findById(req.params.id).populate("userId");
  if (!request) return res.status(404).json({ message: "Not found" });

  request.status = "rejected";
  request.adminComment = req.body.comment || "";
  await request.save();

  const emailStatusText = "❌ Rejected";
  const messageBody = `
    Dear ${request.userId.name},

    Your remote work request for ${new Date(request.date).toDateString()} has been REJECTED.

    📝 HR Comment: ${request.adminComment || "No comment provided."}

    Status: ${emailStatusText}

    Best regards,  
    HR Salma Ghanem 
  `;
  sendEmail(request.userId.email, "Remote Work Request Status Update", messageBody);

  res.json(request);
};
