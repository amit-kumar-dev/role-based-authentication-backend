const express = require("express");
const upload = require("../middlewares/upload.middleware");
const musicController = require("../controllers/music.controller");
const albumController = require("../controllers/album.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();



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
 * ✅ Get All music
 */
router.get(
  "/all",
  authMiddleware.authUser,
  musicController.getAllMusic,
);

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
 * ✅ multipart/form-data
 * Create album + upload multiple tracks
 */
router.post(
  "/al-upload",
  authMiddleware.authArtist,
  upload.array("album", 20),
  albumController.createAlbum,
);

/**
 * ✅ multipart/form-data
 * Create album + upload multiple tracks
 */
router.get(
  "/all-albums",
  authMiddleware.authUser,
  albumController.getAllAlbums,
);

module.exports = router;
