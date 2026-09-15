/**
 * Centralized error handling middleware.
 * Catches all unhandled errors passed through next(err) and formats a consistent JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error in non-production environments
  if (process.env.NODE_ENV !== "test") {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};
