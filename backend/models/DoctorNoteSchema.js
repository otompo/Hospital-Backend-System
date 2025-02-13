const mongoose = require("mongoose");

const DoctorNoteSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    encryptedNote: { type: String, required: true }, // Encrypted note
    checklist: [{ type: String }], // Extracted one-time tasks
    plan: [{ action: String, schedule: String }], // Scheduled actions
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorNote", DoctorNoteSchema);
