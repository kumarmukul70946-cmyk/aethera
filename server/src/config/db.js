import mongoose from "mongoose";

/**
 * Connect to MongoDB using Mongoose.
 * Reads connection URI from process.env.MONGODB_URI.
 * Terminates the process if the initial connection cannot be established.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("[Database Error] MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);

    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
