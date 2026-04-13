const jwt = require("jsonwebtoken");

async function authArtist(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: Token missing",
    });
  }

  /* -------------------- 2. Verify JWT -------------------- */
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* -------------------- 3. Role check -------------------- */
    if (decoded.role !== "artist") {
      return res.status(403).json({
        message: "Forbidden: Only artists can upload music",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
}

module.exports = { authArtist };
