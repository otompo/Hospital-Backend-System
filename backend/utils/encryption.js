const crypto = require("crypto");

const SECRET_KEY = process.env.SECRET_KEY
  ? crypto.createHash("sha256").update(process.env.SECRET_KEY).digest() // Ensure 32 bytes
  : crypto.randomBytes(32); // Fallback: Generate a secure key

const IV_LENGTH = 16; // AES IV must be 16 bytes

exports.encryptData = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + encrypted; // Store IV with encrypted text
};

exports.decryptData = (encryptedText) => {
  const iv = Buffer.from(encryptedText.substring(0, 32), "hex"); // Extract IV
  const encrypted = encryptedText.substring(32);

  const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
