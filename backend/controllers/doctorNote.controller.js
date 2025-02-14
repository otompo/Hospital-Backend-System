const DoctorNote = require("../models/DoctorNoteSchema");
const Reminder = require("../models/ReminderSchema");
const { encryptData, decryptData } = require("../utils/encryption");
const { processDoctorNotes } = require("../utils/llmIntegration");
const { addDays } = require("date-fns");

exports.submitDoctorNote = async (req, res) => {
  try {
    const { patientId, note } = req.body;
    const encryptedNote = encryptData(note);

    // Process with LLM to extract checklist & plan
    const { checklist, plan } = await processDoctorNotes(note);

    // Cancel only the reminders created by this doctor for this patient
    await Reminder.deleteMany({ patient: patientId, doctor: req.user._id });

    // Save new doctor note
    const newNote = new DoctorNote({
      doctor: req.user._id,
      patient: patientId,
      encryptedNote,
      checklist,
      plan,
    });
    await newNote.save();

    // Create new reminders with dynamic scheduling
    const reminders = [];
    plan.forEach((item) => {
      const match = item.schedule.match(/(\d+) days?/i);
      if (!match) return;

      const duration = parseInt(match[1], 10);
      let missedDays = 0;

      for (let i = 0; i < duration + missedDays; i++) {
        reminders.push({
          patient: patientId,
          doctor: req.user._id, // Ensure the reminder is linked to the doctor
          action: item.action,
          dueDate: addDays(new Date(), i), // Schedule daily reminders
          status: "pending",
        });
      }
    });

    // Insert reminders into database
    if (reminders.length > 0) {
      await Reminder.insertMany(reminders);
    }

    res
      .status(201)
      .json({ message: "Note processed and reminders scheduled." });
  } catch (error) {
    console.error("❌ Error:", error);
    res
      .status(500)
      .json({ message: "Error processing note", error: error.message });
  }
};

exports.checkInReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminder.status = "completed";
    await reminder.save();

    // Check if patient missed any day, extend by 1 day
    const lastReminder = await Reminder.findOne({
      patient: reminder.patient,
    }).sort("-dueDate");
    if (lastReminder && lastReminder.status === "pending") {
      const newReminder = new Reminder({
        patient: reminder.patient,
        action: reminder.action,
        dueDate: addDays(new Date(lastReminder.dueDate), 1), // Extend by 1 day
        status: "pending",
      });
      await newReminder.save();
    }

    res.status(200).json({ message: "Reminder checked in successfully." });
  } catch (error) {
    console.error("❌ Error:", error);
    res
      .status(500)
      .json({ message: "Error checking in reminder", error: error.message });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      patient: req.user._id,
      status: "pending",
    }).sort("dueDate");
    res.status(200).json({ reminders });
  } catch (error) {
    console.error("❌ Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching reminders", error: error.message });
  }
};

exports.getMyNotesDoctor = async (req, res) => {
  try {
    const notes = await DoctorNote.find({
      doctor: req.user._id,
    }).sort("dueDate");

    // Decrypt each note
    const decryptedNotes = notes.map((note) => ({
      ...note.toObject(), // Convert Mongoose document to plain object
      encryptedNote: decryptData(note.encryptedNote),
    }));

    res
      .status(200)
      .json({ message: "Notes retrieved successfully", notes: decryptedNotes });
  } catch (error) {
    console.error("❌ Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching reminders", error: error.message });
  }
};
exports.getMyNotesPatient = async (req, res) => {
  try {
    const notes = await DoctorNote.find({
      patient: req.user._id,
    }).sort("dueDate");

    // Decrypt each note
    const decryptedNotes = notes.map((note) => ({
      ...note.toObject(), // Convert Mongoose document to plain object
      encryptedNote: decryptData(note.encryptedNote),
    }));

    res
      .status(200)
      .json({ message: "Notes retrieved successfully", notes: decryptedNotes });
  } catch (error) {
    console.error("❌ Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching reminders", error: error.message });
  }
};
