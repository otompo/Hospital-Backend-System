const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // References the Doctor in the User model
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the Patient model
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now, // Timestamp for when the assignment was made
    },
    status: {
      type: String,
      enum: ["active", "completed", "canceled"],
      default: "active", // Allows tracking of past assignments
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
