const Admin = require("../models/AdminSchema");
const User = require("../models/UserSchema");
const Doctor = require("../models/DoctorSchema");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { generate10DigitUUID } = require("../helpers/generater");
const { hashPassword } = require("../helpers/auth");

/**
 * @function addAdmin
 * @desc    Creates a new admin user account.
 * @access  Private (Admin only)
 * @route   POST /user/admin
 * @param   {string} req.body.email - The email address of the admin.
 * @param   {string} req.body.name - The full name of the admin.
 * @param   {string} req.body.phone - The phone number of the admin.
 * @returns {Object} JSON response with the newly created admin details.
 */
exports.addAdmin = catchAsync(async (req, res, next) => {
  try {
    const { email, name, phone } = req.body;

    // Check if the email is already taken
    const adminExist = await Admin.findOne({ email }).exec();
    if (adminExist) {
      return next(new AppError("Email is already taken", 400));
    }

    // Generate and hash a temporary password
    const password = generate10DigitUUID();
    const hashedPassword = await hashPassword(password);

    // Create a new admin user
    const user = new Admin({
      name,
      email,
      phone,
      role: "admin",
      password: hashedPassword,
      generatedPassword: password,
    });

    // Save the user in the database
    await user.save();

    // Respond with the newly created user details
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in addAdmin:", error);
    next(error);
  }
});

/**
 * @function regenerateAdminLostPassword
 * @desc    Resets and regenerates a new password for an admin user.
 * @access  Private (Admin only)
 * @route   PUT /regenerate/admin-password/:id
 * @param   {string} req.params.id - The ID of the admin user.
 * @returns {Object} JSON response with the newly generated password.
 */
exports.regenerateAdminLostPassword = catchAsync(async (req, res, next) => {
  // Find admin by ID
  const user = await Admin.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Generate and hash a new password
  const password = generate10DigitUUID();
  const hashedPassword = await hashPassword(password);

  // Update admin's password in the database
  const admin = await Admin.findByIdAndUpdate(
    user._id,
    { password: hashedPassword, generatedPassword: password },
    { new: true }
  );

  // Respond with the new password
  res.status(200).send({ status: true, password: admin.generatedPassword });
});

/**
 * @function trashAndUnTrashUser
 * @desc    Toggles a user's active status (trash/untrash).
 * @access  Private (Admin only)
 * @route   PUT /moveusertotrash/:id
 * @param   {string} req.params.id - The ID of the user.
 * @returns {Object} JSON response indicating the new user status.
 */
exports.trashAndUnTrashUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Search for the user in Admin, Doctor, or User collections
  const user =
    (await User.findById(id).select("+active")) ||
    (await Doctor.findById(id).select("+active")) ||
    (await Admin.findById(id).select("+active"));

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Toggle the active status
  user.active = !user.active;
  await user.save();

  // Respond with the updated user status
  res.status(200).json({
    ok: true,
    message: `User has been ${
      user.active ? "untrashed" : "trashed"
    } successfully`,
  });
});
