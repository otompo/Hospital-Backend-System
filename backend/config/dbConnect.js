const mongoose = require("mongoose");
const Env = process.env.NODE_ENV;

let DBURI;

if (Env === "development") {
  DBURI = process.env.MONGODB_URL;
} else {
  DBURI = process.env.MONGODB_URL;
}

const connectDB = async () => {
  await mongoose.connect(DBURI, {});

  console.log(`DATABASE CONNECTED`);
};

module.exports = connectDB;
