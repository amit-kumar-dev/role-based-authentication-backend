const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.route");
const musicRoutes = require("./routes/music.route");

const app = express();
app.use(cookieParser());
app.use(express.json()); //midleware
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/album", musicRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE / 1024 / 1024}MB`,
    });
  }

  if (err.code === "LIMIT_PART_COUNT") {
    return res.status(400).json({
      message: "Too many files uploaded",
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
