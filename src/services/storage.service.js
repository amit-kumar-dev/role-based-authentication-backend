const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("./minio");

/**
 * Sanitize filename to avoid path traversal and invalid keys.
 * Keeps name readable but removes folder separators.
 */
function sanitizeFileName(name = "") {
  // Remove any directory components and replace slashes
  return name
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .replace(/[<>:"|?*\x00-\x1F]/g, "_") // Windows-illegal + control chars
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Upload file to MinIO (S3 compatible) with ORIGINAL filename (no renaming)
 * @param {Object} file - multer file object
 * @param {String} folder - e.g. "album/audio", "music/images"
 */
async function uploadFile(file, folder = "uploads") {
  try {
    // ✅ Validate inputs
    if (!file || !file.buffer) {
      throw new Error("Invalid file object: missing buffer");
    }

    if (!process.env.MINIO_BUCKET) {
      throw new Error("MINIO_BUCKET environment variable not configured");
    }

    // ✅ Normalize folder and keep original filename (no timestamp / uuid)
    const safeFolder = String(folder).replace(/^\/+|\/+$/g, ""); // trim leading/trailing /
    const safeName = sanitizeFileName(file.originalname);

    if (!safeName) {
      throw new Error("Invalid original file name");
    }

    const key = safeFolder ? `${safeFolder}/${safeName}` : safeName;

    console.log(`📤 Uploading file to MinIO: ${key}`);

    // 1️⃣ Upload (authenticated)
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    console.log(`✅ File uploaded successfully: ${key}`);

    // 2️⃣ Generate signed URL
    // Optional: set filename in response so browser uses correct name
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: key,
        ResponseContentType: file.mimetype,
        ResponseContentDisposition: `inline; filename="${safeName}"`,
      }),
      { expiresIn: 60 * 60 }, // 1 hour
    );

    console.log(`🔗 Signed URL generated for: ${key}`);

    return {
      key,
      url: signedUrl,
      mimeType: file.mimetype,
      size: file.size || 0,
      originalName: safeName,
    };
  } catch (error) {
    console.error("❌ Upload File Error:", error.message);
    throw new Error(`File upload failed: ${error.message}`);
  }
}

module.exports = { uploadFile };
