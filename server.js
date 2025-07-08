import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import remoteWorkRoutes from "./routes/remoteWork.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userDetailsRoutes from "./routes/userDetailsRoutes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://leavestream.netlify.app",
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/remote", remoteWorkRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-details", userDetailsRoutes);


app.get("/", (req, res) => {
    res.send("Server is up and running!");
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.log("MongoDB connection failed:", err);
    });
