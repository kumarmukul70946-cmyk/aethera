import mongoose from "mongoose";

/**
 * Health check controller to verify API and Database availability.
 *
 * @route GET /api/health
 * @access Public
 */
export const getHealthStatus = (req, res) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isConnected = mongoose.connection.readyState === 1;

  const statusCode = isConnected ? 200 : 503;

  res.status(statusCode).json({
    success: isConnected,
    message: "Aethera Commerce API is running",
    database: isConnected ? "connected" : "disconnected"
  });
};
