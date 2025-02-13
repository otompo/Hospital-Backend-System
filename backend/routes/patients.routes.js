const router = require("express").Router();

const {
  getAllPatients,
  readSinglePatient,
  myAssignedDoctors,
} = require("../controllers/patients.controller");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");

/**
 * @route   GET /patients
 * @desc    Retrieve a list of all registered patients
 * @access  Private (Admin only)
 * @headers {string} Authorization - Bearer token for authentication
 */
router.route("/patients").get(authenticate, isAdmin, getAllPatients);

/**
 * @route   GET /patients/:patientId
 * @desc    Retrieve details of a specific patient by ID
 * @access  Private (Admin only)
 * @param   {string} patientId - The unique identifier of the patient
 * @headers {string} Authorization - Bearer token for authentication
 */
router
  .route("/patients/:patientId")
  .get(authenticate, isAdmin, readSinglePatient);

/**
 * @route   GET /my-assigned-doctors
 * @desc    Retrieve a list of doctors assigned to the authenticated patient
 * @access  Private (Authenticated Patients only)
 * @headers {string} Authorization - Bearer token for authentication
 */
router.get("/my-assigned-doctors", authenticate, myAssignedDoctors);

module.exports = router;
