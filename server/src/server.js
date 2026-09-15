import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap sequence:
 * 1. Connect to MongoDB database
 * 2. Start HTTP server listener
 */
const startServer = async () => {
  // Connect to database; terminates process if connection fails
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Aethera Server] Running on http://localhost:${PORT}`);
    console.log(`[Aethera Server] Health endpoint: http://localhost:${PORT}/api/health`);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log("\n[Aethera Server] Gracefully shutting down...");
    server.close(async () => {
      console.log("[Aethera Server] HTTP server closed.");
      try {
        await mongoose.connection.close(false);
        console.log("[Aethera Server] MongoDB connection closed.");
      } catch (err) {
        console.error("[Aethera Server] Error closing MongoDB:", err.message);
      }
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer();
