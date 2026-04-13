const express = require("express");
const upload = require("../middlewares/upload.middleware");
const musicController = require("../controllers/music.controller");
const albumController = require("../controllers/album.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * ✅ JSON ONLY
 * Create album from already uploaded music IDs
 */
router.post(
  "/album",
  authMiddleware.authArtist,
  albumController.createAlbumFromIds,
);

/**
 * ✅ Upload single music
 */
router.post(
  "/upload",
  authMiddleware.authArtist,
  upload.single("file"),
  musicController.createMusic,
);

/**
 * ✅ multipart/form-data
 * Create album + upload multiple tracks
 */
router.post(
  "/album/upload",
  authMiddleware.authArtist,
  upload.array("album", 20),
  albumController.createAlbum,
);

module.exports = router;
