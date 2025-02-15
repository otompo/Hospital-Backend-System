const jwt = require("jsonwebtoken");

exports.generateTokens = (user) => {
  const tokenPayload = {
    id: user._id,
    username: user.username,
    role: user.role, // Assuming role has a 'name' field
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRED_AT,
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRED_AT,
  });

  return { accessToken, refreshToken };
};
