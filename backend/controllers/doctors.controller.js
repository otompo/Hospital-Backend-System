// get users

const Assignment = require("../models/AssignmentSchema");
const Doctor = require("../models/DoctorSchema");
const catchAsync = require("../utils/catchAsync");

exports.getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await Doctor.find({})
    .populate({
      path: "role",
    })
    .select("-password +active")

    .sort({ createdAt: -1 });
  res.status(200).send({ message: "Doctors retrieved successfully", doctors });
});

// get single user data
exports.readSingleDoctor = catchAsync(async (req, res, next) => {
  let { patientId } = req.params;
  const user = await Doctor.findById({ patientId })
    .select("-password")
    .populate({
      path: "role",
    });

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).send(user);
});

// Get all patients assigned to a specific doctor
exports.myAssignedPatients = async (req, res) => {
  try {
    // Find all assignments where the doctor is assigned to a patient
    const assignments = await Assignment.find({
      doctor: req.user.id,
      status: "active",
    }).populate({
      path: "patient",
      select: "-password", // Exclude password
    });

    if (!assignments.length) {
      return res
        .status(404)
        .json({ message: "No patients assigned to this doctor" });
    }

    res.status(200).json({
      message: "Assigned patients retrieved successfully",
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
