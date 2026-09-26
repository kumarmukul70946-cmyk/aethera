import app from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";

/**
 * Vercel Serverless Function entry point for Aethera REST API.
 * Connects to MongoDB Atlas (with connection caching) and passes the request to Express.
 */
export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error("[Vercel API Handler] Database connection error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed. Please check MONGODB_URI in Vercel environment variables.",
      error: error.message
    });
  }

  // Ensure req.url begins with /api if rewrite stripped the prefix
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
}
