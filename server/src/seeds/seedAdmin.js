import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

/**
 * Seed an administrator account from environment variables.
 * Ensures admin credentials are not hardcoded and duplicate admins are avoided.
 */
const seedAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME || "Aethera Admin";
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(
        "[Admin Seed Error] ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment variables."
      );
      process.exit(1);
    }

    console.log("[Admin Seed] Connecting to database...");
    await connectDB();

    const normalizedEmail = adminEmail.toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      console.log(
        `[Admin Seed] User with email '${normalizedEmail}' already exists (Role: ${existingAdmin.role}).`
      );
      console.log("[Admin Seed] Exiting without modifying existing credentials.");
      await mongoose.connection.close();
      process.exit(0);
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const adminUser = await User.create({
      name: adminName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      avatar: ""
    });

    console.log("\n=========================================");
    console.log("  Aethera Admin Account Seeded!  ");
    console.log(`  - Name:  ${adminUser.name}`);
    console.log(`  - Email: ${adminUser.email}`);
    console.log(`  - Role:  ${adminUser.role}`);
    console.log("=========================================\n");

    await mongoose.connection.close();
    console.log("[Admin Seed] Database connection closed cleanly.");
    process.exit(0);
  } catch (error) {
    console.error(`[Admin Seed Error] Seeding failed: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
