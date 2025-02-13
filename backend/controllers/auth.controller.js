const User = require("../models/UserSchema");
const Doctor = require("../models/DoctorSchema");
const Admin = require("../models/AdminSchema");
const { generateTokens } = require("../utils/token");
const { comparePassword, hashPassword } = require("../helpers/auth");
const AppError = require("../utils/appError");

exports.register = async (req, res) => {
  const { email, name, password, role } = req.body;
  try {
    let user = null;
    if (role === "patient") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    }
    // check if user exist
    if (user) {
      return res.status(400).json({ message: "User already exist." });
    }
    // hash password
    const newPassword = await hashPassword(password);

    if (role === "patient") {
      user = new User({
        email,
        name,
        password: newPassword,
        role,
      });
    }
    if (role === "doctor") {
      user = new Doctor({
        email,
        name,
        password: newPassword,
        role,
      });
    }
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User successfully created" });
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Regular expression to check if the identifier is an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid email format." });
  }

  try {
    // Check if user exists in either User or Doctor collection
    const user =
      (await User.findOne({ email }).select("+password +active")) ||
      (await Doctor.findOne({ email }).select("+password +active")) ||
      (await Admin.findOne({ email }).select("+password +active"));

    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User not found." });
    }

    // Validate password
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials." });
    }

    // Generate token
    const token = generateTokens(user);

    // Remove sensitive data before sending response
    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      status: true,
      message: "Login Success",
      token,
      data: userData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
    });
  }
};

exports.signOut = async (req, res, next) => {
  try {
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out success" });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  // 1) Get user based on POSTed email
  const user =
    (await User.findOne({ email }).select("+active")) ||
    (await Doctor.findOne({ email }).select("+active"));

  if (!user)
    return next(new AppError("There is no user with email address", 404));
  // 2) Generate the random reset token
  const resetToken = generate10DigitUUID();
  const passwordResetExpires = Date.now() + 10 * 60 * 1000;

  const resetURL = `${process.env.ORIGIN}/resetpassword/${resetToken}`;

  await sendEmail({
    fromemail: process.env.OFFICIAL_EMAIL,
    email: email,
    subject: "Forget Password Token",
    html: forgotPasswordTemplate(resetURL),
  });

  try {
    await User.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetExpires: passwordResetExpires,
        },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    res.status(500).json({
      flag: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Hash the new password using bcryptjs
    const hashedPassword = await bcryptjs.hash(req.body.password, 10);

    // 2) Find user based on the token, token expiration, and active status

    const user =
      (await User.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() },
        active: { $ne: false },
      }).select("+active")) ||
      (await Doctor.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() },
        active: { $ne: false },
      }).select("+active"));
    // 3) Check if the user exists and is active
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    // 4) Set the new password, clear reset token, and save the user
    user.password = hashedPassword;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    const { password: hashedPasswordField, ...rest } = user._doc;

    res.status(200).json({ flag: true, message: "success" });
  } catch (error) {
    res.status(400).json({
      flag: false,
      message: error.message,
    });
  }
};
