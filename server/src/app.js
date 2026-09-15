import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "dotenv/config";

import apiRouter from "./routes/index.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";

const app = express();

// 1. Security HTTP headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 3. Request body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. Cookie parser
app.use(cookieParser());

// 5. Rate limiting for API routes
app.use("/api", apiRateLimiter);

// 6. Mount API routes
app.use("/api", apiRouter);

// 7. Catch-all for unhandled routes (404)
app.use(notFoundHandler);

// 8. Centralized error handling
app.use(errorHandler);

export default app;
