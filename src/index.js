// Dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Environment Variables
dotenv.config();
const PORT = process.env.PORT;
const app = express();

// Import Routes
const authRouter = require("./routes/authRouter");
const projectRouter = require("./routes/projectRouter");
const taskRouter = require("./routes/taskRouter");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);

// Error Handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Express API is running on port ${PORT}`);
});
