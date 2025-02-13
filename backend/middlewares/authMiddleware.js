// middleware/authMiddleware.js
const Doctor = require("../models/DoctorSchema");
const User = require("../models/UserSchema");
const Admin = require("../models/AdminSchema");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

exports.authenticate = async (req, res, next) => {
  let token;

  // Check if authorization header is present and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from the Authorization header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using the JWT_ACCESS_SECRET
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Find the user in the User or Admin collection
      const user =
        (await User.findById(decoded.id).select("+role")) ||
        (await Admin.findById(decoded.id).select("+role")) ||
        (await Doctor.findById(decoded.id).select("+role"));

      // If the user is not found, return an error
      if (!user) {
        return res.status(401).json({
          flag: false,
          error: "User not found",
        });
      }

      // Attach the user to the request object
      req.user = user;

      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      return res.status(401).json({
        flag: false,
        error: "Not authorized, Token is not valid",
      });
    }
  } else {
    // If no token was provided in the authorization header
    return res.status(401).json({
      flag: false,
      error: "Not authorized, No token provided",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await Admin.findById(req.user.id);

    if (!user) {
      return next(new AppError("User not found!", 404));
    }

    if (user.role !== "admin") {
      return next(new AppError("You do not have the required role!", 403));
    }

    next();
  } catch (err) {
    console.log(err);
    next(new AppError("Internal Server Error", 500));
  }
};

exports.isDoctor = async (req, res, next) => {
  try {
    const user = await Doctor.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found!", 404));
    }

    if (user.role !== "doctor") {
      return next(new AppError("You do not have the required role!", 403));
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};
