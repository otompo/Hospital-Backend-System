const express = require("express");
const {
  assignDoctorToPatient,
  getDoctorPatients,
  unassignDoctor,
  cancelDoctor,
  getPatientDoctors,
  assignDoctor,
} = require("../controllers/assignment.controller");

const { authenticate, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @route   POST /assign
 * @desc    Allow a patient to assign themselves to a doctor
 * @access  Private (Authenticated users)
 * @middleware authenticate - Ensures the user is authenticated
 */
router.post("/assign", authenticate, assignDoctor);

/**
 * @route   GET /doctor/:doctorId/patients
 * @desc    Retrieve all patients assigned to a specific doctor
 * @access  Private (Only authenticated admins)
 * @middleware authenticate - Ensures the user is authenticated
 * @middleware isAdmin - Ensures the user has admin privileges
 */
router.get(
  "/doctor/:doctorId/patients",
  authenticate,
  isAdmin,
  getDoctorPatients
);

/**
 * @route   GET /patient/:patientId/doctor
 * @desc    Retrieve all doctors assigned to a specific patient
 * @access  Private (Only authenticated admins)
 * @middleware authenticate - Ensures the user is authenticated
 * @middleware isAdmin - Ensures the user has admin privileges
 */
router.get(
  "/patient/:patientId/doctor",
  authenticate,
  isAdmin,
  getPatientDoctors
);

/**
 * @route   PUT /unassign/:assignmentId
 * @desc    Unassign a doctor from a patient
 * @access  Private (Only authenticated admins)
 * @middleware authenticate - Ensures the user is authenticated
 * @middleware isAdmin - Ensures the user has admin privileges
 */
router.put("/unassign/:assignmentId", authenticate, isAdmin, unassignDoctor);

/**
 * @route   POST /cancel-doctor
 * @desc    Cancel a doctor's assignment for a patient
 * @access  Private (Only authenticated admins)
 * @middleware authenticate - Ensures the user is authenticated
 * @middleware isAdmin - Ensures the user has admin privileges
 */
router.post("/cancel-doctor", authenticate, isAdmin, cancelDoctor);

module.exports = router;
