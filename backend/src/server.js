require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const summarizeRoutes = require("./routes/summarizeRoutes");
const authRoutes = require("./routes/authRoutes");
const summariesRoutes = require("./routes/summariesRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api", summariesRoutes);
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
