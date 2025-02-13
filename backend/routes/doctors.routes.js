const router = require("express").Router();

const {
  myAssignedPatients,
  readSingleDoctor,
  getAllDoctors,
} = require("../controllers/doctors.controller");
const { isAdmin, authenticate } = require("../middlewares/authMiddleware");

router.route("/doctors").get(authenticate, getAllDoctors);
router
  .route("/doctors/:patientId")
  .get(authenticate, isAdmin, readSingleDoctor);
router.get("/my-assigned-patients", authenticate, myAssignedPatients);

module.exports = router;
