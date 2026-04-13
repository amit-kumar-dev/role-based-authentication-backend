const fs = require("fs");
const path = require("path");

/**
 * Ensure upload directory exists and return absolute path
 */
function ensureUploadDir() {
  const uploadDir = process.env.UPLOAD_DIR || "src/images";

  const absPath = path.isAbsolute(uploadDir)
    ? uploadDir
    : path.join(process.cwd(), uploadDir);

  if (!fs.existsSync(absPath)) {
    fs.mkdirSync(absPath, { recursive: true });
  }

  return absPath;
}

/**
 * Save buffer to local disk and return public URL
 */
async function saveBufferToLocal(buffer, fileName) {
  const uploadDirAbs = ensureUploadDir();
  const filePath = path.join(uploadDirAbs, fileName);

  await fs.promises.writeFile(filePath, buffer);

  return {
    path: filePath,
    url: buildPublicUrl(fileName),
  };
}

/**
 * Build public-facing URL (relative or absolute)
 */
function buildPublicUrl(fileName) {
  const mountPath = (process.env.PUBLIC_MOUNT_PATH || "/images").replace(
    /\/$/,
    "",
  );

  // Optional absolute URL
  if (process.env.VITE_API_BASE_URL) {
    return `${process.env.VITE_API_BASE_URL}${mountPath}/${fileName}`;
  }

  // Relative URL fallback
  return `${mountPath}/${fileName}`;
}

module.exports = {
  ensureUploadDir,
  saveBufferToLocal,
  buildPublicUrl,
};
