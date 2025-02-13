const Reminder = require("../models/ReminderSchema");
const nodeCron = require("node-cron");

// Simulated Notification Function
const sendNotification = (patientId, message) => {
  console.log(`📢 Sending notification to Patient ${patientId}: ${message}`);
};

// Function to check reminders and send notifications
const checkReminders = async () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize to midnight for accurate date matching

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log("🔍 Checking for upcoming and due reminders...");

  // Find reminders for today and tomorrow
  const reminders = await Reminder.find({
    dueDate: { $gte: now, $lte: tomorrow },
    status: "pending",
  });

  for (const reminder of reminders) {
    const reminderDate = new Date(reminder.dueDate);
    reminderDate.setHours(0, 0, 0, 0);

    if (reminderDate.getTime() === now.getTime()) {
      sendNotification(
        reminder.patient,
        `🛑 Reminder for today: ${reminder.action}`
      );
    } else if (reminderDate.getTime() === tomorrow.getTime()) {
      sendNotification(
        reminder.patient,
        `⏳ Upcoming Reminder: ${reminder.action} is due tomorrow!`
      );
    }
  }
};

// Run every hour to check reminders
nodeCron.schedule("0 * * * *", async () => {
  await checkReminders();
});

console.log("⏳ Reminder worker is running...");
module.exports = { checkReminders };
