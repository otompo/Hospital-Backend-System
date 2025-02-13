const Assignment = require("../models/AssignmentSchema");
const User = require("../models/UserSchema");
const Doctor = require("../models/DoctorSchema");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError"); // Import AppError for error handling

// Get all patients from the database
exports.getAllPatients = catchAsync(async (req, res) => {
  const users = await User.find({})
    .populate({
      path: "role", // Populate the role field with related data
    })
    .select("-password +active") // Exclude password and include active status
    .sort({ createdAt: -1 }); // Sort patients by newest first

  res.status(200).send(users);
});

// Get a single patient's details by their ID
exports.readSinglePatient = catchAsync(async (req, res, next) => {
  let { patientId } = req.params;

  // Find the patient by ID and exclude their password field
  const user = await User.findById(patientId).select("-password").populate({
    path: "role",
  });

  // If patient is not found, return a 404 error
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).send(user);
});

// Get all doctors assigned to the logged-in patient
exports.myAssignedDoctors = async (req, res) => {
  try {
    // Find all active assignments where the logged-in patient is assigned to a doctor
    const assignments = await Assignment.find({
      patient: req.user._id, // Get the patient ID from the logged-in user
      status: "active", // Filter only active assignments
    }).populate({
      path: "doctor",
      select: "-password", // Exclude the doctor's password
    });

    // If no doctors are assigned, return a 404 response
    if (!assignments.length) {
      return res
        .status(404)
        .json({ message: "No doctors assigned to this patient" });
    }

    res.status(200).json({
      message: "Assigned doctors retrieved successfully",
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
