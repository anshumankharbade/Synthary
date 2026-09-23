require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const summarizeRoutes = require("./routes/summarizeRoutes");
const authRoutes = require("./routes/authRoutes");
const summariesRoutes = require("./routes/summariesRoutes");
const chatRoutes = require("./routes/chatRoutes");
const shareRoutes = require("./routes/shareRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Supports a comma-separated list so both local dev and the deployed
// frontend can hit this backend without swapping the env var back and
// forth. Trailing slashes are stripped — CORS does exact string
// matching against the browser's Origin header, which never has one,
// so a stray slash in the env var silently breaks every request.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header at all (curl, server-to-server, health checks) -> allow.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin "${origin}" is not in CLIENT_ORIGIN.`));
      }
    },
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api", summariesRoutes);
app.use("/api", chatRoutes);
app.use("/api", shareRoutes);
app.use("/api", uploadRoutes);
app.use("/api", summarizeRoutes);

// Anything under /api that didn't match a route above.
app.use((req, res) => res.status(404).json({ success: false, error: "Not found" }));

app.use(errorHandler);

async function start() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "⚠️  GEMINI_API_KEY not set — every /api/summarize call will fail. " +
        "Add a real key to backend/.env (free at https://aistudio.google.com/apikey), then restart."
    );
  }

  if (!process.env.JWT_SECRET) {
    console.warn(
      "⚠️  JWT_SECRET not set — signup/login will fail with a 500. " +
        "Add any long random string to backend/.env, then restart."
    );
  }

  if (!process.env.ASSEMBLYAI_API_KEY) {
    console.warn(
      "⚠️  ASSEMBLYAI_API_KEY not set — audio uploads will fail (PDF uploads are unaffected). " +
        "Add a free key from assemblyai.com to backend/.env, then restart."
    );
  }

  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (err) {
      console.error("MongoDB connection failed — continuing without persistence:", err.message);
    }
  } else {
    console.warn(
      "⚠️  MONGODB_URI not set — auth and history need a real database now. " +
        "Signup/login will return a 503 until this is set. See .env.example."
    );
  }

  app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
}

start();
