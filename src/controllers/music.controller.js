const musicModel = require("../models/music.model");
const { uploadFile } = require("../services/storage.service");

/**
 * Create / Upload Music
 * Only artists are allowed (auth middleware)
 */
async function createMusic(req, res) {
  try {
    // ✅ DEBUG (optional)
    console.log("createMusic → req.file:", req.file?.originalname);

    /* -------------------- 1. File validation -------------------- */
    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    /* -------------------- 2. Decide folder -------------------- */
    let folder = "music";

    if (req.file.mimetype.startsWith("audio/")) {
      folder = "music/audio";
    } else if (req.file.mimetype.startsWith("video/")) {
      folder = "music/video";
    } else if (req.file.mimetype.startsWith("image/")) {
      folder = "music/images";
    }

    /* -------------------- 3. Upload to MinIO -------------------- */
    let uploadResult;
    try {
      uploadResult = await uploadFile(req.file, folder);
    } catch (uploadError) {
      console.error("MinIO Upload Error:", uploadError);
      return res.status(500).json({
        message: `File upload failed: ${uploadError.message}`,
        error:
          process.env.NODE_ENV === "development"
            ? uploadError.message
            : undefined,
      });
    }

    /* -------------------- 4. Save record in DB -------------------- */
    let music;
    try {
      music = await musicModel.create({
        title: req.body.title || "",
        artist: req.user.id,
        fileKey: uploadResult.key,
        fileUrl: uploadResult.url,
        fileType: req.file.mimetype,
        fileSize: req.file.size || 0,
        originalName: req.file.originalname,
      });

      console.log(`✅ Music record created in DB: ${music._id}`);
    } catch (dbError) {
      console.error("Database Error:", dbError);
      return res.status(500).json({
        message: "Failed to save music record to database",
        error:
          process.env.NODE_ENV === "development" ? dbError.message : undefined,
      });
    }

    /* -------------------- 5. Response -------------------- */
    return res.status(201).json({
      message: "Music uploaded successfully",
      music: {
        id: music._id,
        title: music.title,
        playUrl: uploadResult.url,
      },
    });
  } catch (error) {
    console.error("Create Music Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}


async function getAllMusic(req, res) {
  try {
    const musicList = await musicModel.find().populate("artist", "username");
    return res.status(200).json({
      message: "Music list retrieved successfully",
      music: musicList,
    });
  } catch (error) {
    console.error("Get All Music Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}



module.exports = { createMusic, getAllMusic };
