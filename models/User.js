import mongoose from "mongoose";
import bcrypt from "bcrypt";

    const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    leaveBalance: {
        annual: { type: Number, default: 21 },
        sick: { type: Number, default: 10 },
        unpaid: { type: Number, default: 0 },
    },
    hireDate: { type: Date, default: Date.now , required: true },  
    }, { timestamps: true });

    userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
    });

    userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
    };

const User = mongoose.model("User", userSchema);
export default User;
