import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    jobTitle: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    hireDate: { type: Date, required: true },
    employeeCode: { type: String,  unique: true },
    employeeStatus: {
      type: String,
      enum: ["active", "resigned"],
      default: "active"
    },
    resignationReason: {
      type: String,
      required: function () {
        return this.employeeStatus === "resigned";
      },
      validate: {
        validator: function(value) {
          return this.employeeStatus !== "resigned" || (value && value.length > 0);
        },
        message: "Resignation reason is required if employment status is resigned."
      }
    },
    resignationDate: {
      type: Date,
      required: function () {
        return this.employeeStatus === "resigned";
      },
      validate: {
        validator: function (value) {
          return this.employeeStatus !== "resigned" || !!value;
        },
        message: "Resignation date is required if employment status is resigned."
      }
    },
    

    contractStart: { type: Date },
    contractEnd: { type: Date },
    salary: { type: Number },
    transportationAllowance: { type: Number },

    nationalID: { type: String },
    nationalIDExpiry: { type: Date },
    birthDate: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female"] },
    maritalStatus: { type: String },
    nationalIDAddress: { type: String },
    governorate: { type: String },

    personalPhone: { type: String },
    companyPhone: { type: String },

    insuranceStatus: { type: String, enum: ["insured", "not_insured"] },
    insuranceNumber: { type: String },

    qualificationName: { type: String },
    qualificationOriginalAvailable: { type: Boolean, default: false },
    birthCertificateAvailable: { type: Boolean, default: false },
    militaryServiceAvailable: { type: Boolean, default: false },
    criminalRecordAvailable: { type: Boolean, default: false },
    workCardAvailable: { type: Boolean, default: false },
    insurancePrintAvailable: { type: Boolean, default: false },
    nationalIDCopyAvailable: { type: Boolean, default: false },
    skillsCertificateAvailable: { type: Boolean, default: false },

    profileImage: { type: String },

    leaveBalance: {
      annual: { type: Number, default: 21 },
      sick: { type: Number, default: 10 },
      unpaid: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

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
