const { v4: uuidv4 } = require("uuid");

exports.generate10DigitUUID = () => {
  const uuid = uuidv4();
  const truncatedUuid = uuid.replace(/-/g, "").slice(0, 10);
  return truncatedUuid;
};
