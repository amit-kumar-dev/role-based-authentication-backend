const Album = require("../models/album.model");
const Music = require("../models/music.model");
const { uploadFile } = require("../services/storage.service");

// ---------- Helpers ----------
function normalizeTitle(title) {
  return Array.isArray(title) ? title[0] : title;
}

function parseJsonArrayString(value, fieldName = "musicIds") {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed))
      throw new Error(`${fieldName} must be a JSON array`);
    return parsed;
  }

  throw new Error(`${fieldName} must be a JSON array string`);
}

async function validateMusicOwnership(musicIds, artistId) {
  const count = await Music.countDocuments({
    _id: { $in: musicIds },
    artist: artistId,
  });
  return count === musicIds.length;
}

// =====================================================
// ✅ FEATURE 1: Create album from existing Music IDs (JSON only)
// POST /api/music/album
// Body: { "title": "Steven Artist", "album": ["id1","id2"] }
// =====================================================
async function createAlbumFromIds(req, res) {
  try {
    const { title, album } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Album title is required" });
    }

    if (!Array.isArray(album) || album.length === 0) {
      return res.status(400).json({
        message: "album must be a non-empty array of music IDs",
      });
    }

    // ✅ Validate IDs exist & belong to logged-in artist
    const ok = await validateMusicOwnership(album, req.user.id);
    if (!ok) {
      return res.status(400).json({
        message:
          "One or more music IDs are invalid OR do not belong to this artist",
      });
    }

    const created = await Album.create({
      title: title.trim(),
      artist: req.user.id,
      musics: album,
    });

    return res.status(201).json({
      message: "Album created successfully (from existing musics)",
      album: created,
    });
  } catch (err) {
    console.error("createAlbumFromIds Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// =====================================================
// ✅ FEATURE 2: Create album with uploads + optional existing IDs (multipart)
// POST /api/music/album/upload
// form-data:
//   title: "My Album"
//   musicIds: '["existingId1","existingId2"]' (optional)
//   album: (File) track1.mp3  (multiple allowed)
//   album: (File) track2.mp3
// =====================================================
async function createAlbum(req, res) {
  try {
    let { title, musicIds } = req.body || {};
    title = normalizeTitle(title);

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Album title is required" });
    }

    // ✅ existing IDs (optional)
    let finalMusicIds = [];
    if (musicIds) {
      let parsedIds;
      try {
        parsedIds = parseJsonArrayString(musicIds, "musicIds");
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }

      const ok = await validateMusicOwnership(parsedIds, req.user.id);
      if (!ok) {
        return res.status(400).json({
          message:
            "One or more musicIds are invalid OR do not belong to this artist",
        });
      }

      finalMusicIds.push(...parsedIds);
    }

    // ✅ uploaded files
    // - upload.array("album") => req.files is array
    // - upload.fields([{name:"album"}]) => req.files.album
    const filesFromFields = req.files?.album || [];
    const uploadFiles = Array.isArray(req.files) ? req.files : filesFromFields;

    for (const file of uploadFiles) {
      let folder = "album/others";
      if (file.mimetype.startsWith("audio/")) folder = "album/audio";
      else if (file.mimetype.startsWith("video/")) folder = "album/video";
      else if (file.mimetype.startsWith("image/")) folder = "album/images";

      const uploadResult = await uploadFile(file, folder);

      // Create a Music doc for each uploaded track
      const newMusic = await Music.create({
        title: file.originalname,
        artist: req.user.id,
        fileKey: uploadResult.key,
        fileUrl: uploadResult.url,
        fileType: file.mimetype,
        fileSize: file.size || 0,
        originalName: file.originalname,
      });

      finalMusicIds.push(newMusic._id);
    }

    if (finalMusicIds.length === 0) {
      return res.status(400).json({
        message: "Provide musicIds or upload album files",
      });
    }

    const album = await Album.create({
      title: title.trim(),
      artist: req.user.id,
      musics: finalMusicIds,
    });

    return res.status(201).json({
      message: "Album created successfully",
      album,
    });
  } catch (err) {
    console.error("CreateAlbum Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { createAlbumFromIds, createAlbum };
