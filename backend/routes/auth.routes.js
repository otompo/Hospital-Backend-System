const router = require("express").Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

/**
 * @route   POST /auth/register
 * @desc    Register a new user (Patient or Doctor)
 * @access  Public
 * @body    {string} name - Full name of the user
 * @body    {string} email - User's email (unique)
 * @body    {string} password - Secure password for authentication
 * @body    {string} role - Role of the user ("doctor" or "patient")
 */
router.route("/auth/register").post(register);

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and return a JWT token
 * @access  Public
 * @body    {string} email - User's email
 * @body    {string} password - User's password
 */
router.route("/auth/login").post(login);

/**
 * @route   POST /forgotpassword
 * @desc    Initiate password reset by sending an email with a reset link
 * @access  Public
 * @body    {string} email - User's registered email
 */
router.route("/forgotpassword").post(forgotPassword);

/**
 * @route   PATCH /resetpassword/:token
 * @desc    Reset password using a valid reset token
 * @access  Public
 * @param   {string} token - Password reset token sent via email
 * @body    {string} password - New password to set
 */
router.route("/resetpassword/:token").patch(resetPassword);

module.exports = router;
