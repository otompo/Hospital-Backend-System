const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number },
    photo: { type: String },
    role: {
      type: String,
      enum: ["patient"],
      default: "patient",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    gender: { type: String, enum: ["male", "female", "other"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
