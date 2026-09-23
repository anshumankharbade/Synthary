const multer = require("multer");
const AppError = require("../utils/AppError");

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Memory storage: the file arrives as a Buffer, never touches disk. Both
// AssemblyAI and pdf-parse accept a Buffer directly, so there's nothing
// to gain from writing to a temp file first, and this avoids needing to
// clean one up afterward.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(req, file, cb) {
    const isAudio = file.mimetype.startsWith("audio/");
    const isPdf = file.mimetype === "application/pdf";
    if (isAudio || isPdf) {
      cb(null, true);
    } else {
      // A plain Error here would be swallowed by errorHandler's generic
      // fallback (it's neither a MulterError nor "operational") — use
      // AppError so this specific message actually reaches the client.
      cb(new AppError("Only audio files and PDFs are supported.", 400));
    }
  },
});

module.exports = upload;
