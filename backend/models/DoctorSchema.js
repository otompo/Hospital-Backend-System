const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number },
    photo: { type: String },
    role: {
      type: String,
    },
    // Fields for doctors only
    specialization: { type: String },
    qualifications: {
      type: Array,
    },
    experiences: {
      type: Array,
    },
    bio: { type: String, maxLength: 50 },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    appointments: [{ type: mongoose.Types.ObjectId, ref: "Appointment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
