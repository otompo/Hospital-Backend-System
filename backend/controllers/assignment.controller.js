const Assignment = require("../models/AssignmentSchema");
const User = require("../models/UserSchema");
const Doctor = require("../models/DoctorSchema");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/**
 * @function assignDoctor
 * @desc    Assigns a doctor to a patient.
 * @access  Private (Admin or Doctor only)
 * @route   POST /assign-doctor
 * @param   {string} req.body.doctorId - ID of the doctor.
 * @returns {Object} JSON response with assignment details.
 */
exports.assignDoctor = catchAsync(async (req, res, next) => {
  const { doctorId } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || doctor.role !== "doctor") {
    return next(new AppError("Doctor not found", 404));
  }

  const patient = await User.findById(req.user.id);
  if (!patient || patient.role !== "patient") {
    return next(new AppError("Patient not found", 404));
  }

  const existingAssignment = await Assignment.findOne({
    doctor: doctorId,
    patient: req.user.id,
  });
  if (existingAssignment) {
    return next(
      new AppError("Patient is already assigned to this doctor", 400)
    );
  }

  const assignment = await Assignment.create({
    doctor: doctorId,
    patient: req.user.id,
  });

  res.status(201).json({ message: "Doctor assigned successfully", assignment });
});

/**
 * @function getDoctorPatients
 * @desc    Retrieves all patients assigned to a specific doctor.
 * @access  Private (Doctor only)
 * @route   GET /doctor/:doctorId/patients
 * @param   {string} req.params.doctorId - ID of the doctor.
 * @returns {Object} JSON response with assigned patients.
 */
exports.getDoctorPatients = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;

  const assignments = await Assignment.find({ doctor: doctorId })
    .populate({ path: "patient", select: "-password" })
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ message: "Patients retrieved successfully", data: assignments });
});

/**
 * @function getPatientDoctors
 * @desc    Retrieves all doctors assigned to a specific patient.
 * @access  Private (Patient only)
 * @route   GET /patient/:patientId/doctors
 * @param   {string} req.params.patientId - ID of the patient.
 * @returns {Object} JSON response with assigned doctors.
 */
exports.getPatientDoctors = catchAsync(async (req, res, next) => {
  const { patientId } = req.params;

  const assignments = await Assignment.find({ patient: patientId })
    .populate({ path: "doctor", select: "-password" })
    .sort({ createdAt: -1 });

  if (!assignments.length) {
    return next(new AppError("No active doctor found for this patient", 404));
  }

  res
    .status(200)
    .json({ message: "Doctors retrieved successfully", data: assignments });
});

/**
 * @function unassignDoctor
 * @desc    Marks an assignment as completed (unassigns doctor from patient).
 * @access  Private (Admin or Doctor only)
 * @route   PUT /unassign-doctor/:assignmentId
 * @param   {string} req.params.assignmentId - ID of the assignment.
 * @returns {Object} JSON response with updated assignment.
 */
exports.unassignDoctor = catchAsync(async (req, res, next) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return next(new AppError("Assignment not found", 404));
  }

  assignment.status = "completed";
  await assignment.save();

  res
    .status(200)
    .json({ message: "Doctor unassigned successfully", data: assignment });
});

/**
 * @function cancelDoctor
 * @desc    Cancels an active doctor assignment for a patient.
 * @access  Private (Admin or Patient only)
 * @route   PUT /cancel-doctor
 * @param   {string} req.body.doctorId - ID of the doctor.
 * @param   {string} req.body.patientId - ID of the patient.
 * @returns {Object} JSON response confirming cancellation.
 */
exports.cancelDoctor = catchAsync(async (req, res, next) => {
  const { doctorId, patientId } = req.body;

  const assignment = await Assignment.findOne({
    doctor: doctorId,
    patient: patientId,
    status: "active",
  });
  if (!assignment) {
    return next(new AppError("No active assignment found", 404));
  }

  assignment.status = "canceled";
  await assignment.save();

  res.status(200).json({ message: "Doctor assignment canceled successfully" });
});
