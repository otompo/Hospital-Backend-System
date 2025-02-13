const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const {
  submitDoctorNote,
  checkInReminder,
  getReminders,
  getMyNotesPatient,
  getMyNotesDoctor,
} = require("../controllers/doctorNote.controller");

router.post("/doctor/notes", authenticate, submitDoctorNote);
router.patch("/reminders/:reminderId/check-in", authenticate, checkInReminder);
router.get("/reminders", authenticate, getReminders);
router.get("/notes/patient", authenticate, getMyNotesPatient);
router.get("/notes/doctor", authenticate, getMyNotesDoctor);

module.exports = router;
