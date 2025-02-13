const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number },
    role: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    generatedPassword: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
