require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

connectDB();

app.listen(3000, () => {
  console.log("✅ Database connected");
  console.log(`✅ Server running on port ${PORT} [${NODE_ENV}]`);
  console.log(`📁 MinIO Bucket: ${process.env.MINIO_BUCKET}`);
  console.log(
    `🔒 JWT Secret: ${process.env.JWT_SECRET ? "✓ Set" : "❌ Not set"}`,
  );
});
