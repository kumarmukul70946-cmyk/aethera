import mongoose from "mongoose";

let cachedConnection = null;

/**
 * Connect to MongoDB using Mongoose.
 * Reads connection URI from process.env.MONGODB_URI.
 * Caches connection for Serverless environments (e.g., Vercel Functions).
 */
export const connectDB = async () => {
  // If connection is already open or connecting, return active connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = "[Database Error] MONGODB_URI is not defined in environment variables.";
    console.error(errorMsg);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
    throw new Error(errorMsg);
  }

  try {
    cachedConnection = await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected successfully: ${cachedConnection.connection.host}/${cachedConnection.connection.name}`);
    return cachedConnection;
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
