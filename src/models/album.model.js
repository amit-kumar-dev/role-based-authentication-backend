const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },

  musics: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "music",
      require: true,
    },
  ],

  artist: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    require: true,
  },
});

const albumModel = mongoose.model("album", albumSchema);

module.exports = albumModel;
