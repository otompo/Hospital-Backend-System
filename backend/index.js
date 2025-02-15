const { readdirSync } = require("fs");
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/dbConnect");
const cors = require("cors");
const bodyParser = require("body-parser");
const ErrorHandler = require("./utils/errors");
const { checkReminders } = require("./autoscript/reminderWorker");

connectDB();

const app = express();

// Middlewares
app.use(cors("*"));
app.use(express.json({ limit: "70mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

// Root route
app.get("/", (req, res) => {
  res.send("<h4>HMS SERVER</h4>");
});

// Error handler
app.use(ErrorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ::: ${PORT}`);
  checkReminders();
});
