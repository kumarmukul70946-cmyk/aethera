import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

const seedDemoCustomer = async () => {
  try {
    await connectDB();
    const email = "customer@aethera.com";
    const existing = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash("Password123!", 12);

    if (existing) {
      existing.password = hashedPassword;
      existing.role = "customer";
      await existing.save();
      console.log(`[Demo Customer] Updated '${email}' password to Password123!`);
    } else {
      await User.create({
        name: "Demo Customer",
        email,
        password: hashedPassword,
        role: "customer"
      });
      console.log(`[Demo Customer] Created '${email}' with Password123!`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("[Demo Customer Error]", err);
    process.exit(1);
  }
};

seedDemoCustomer();
