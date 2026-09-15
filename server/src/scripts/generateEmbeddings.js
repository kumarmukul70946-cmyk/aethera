import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { generateProductEmbeddingsBatch } from "../services/productEmbeddingService.js";
import { getEmbeddingConfig } from "../services/embeddingService.js";

/**
 * CLI script to generate or update vector embeddings for all products in the catalog.
 * Usage:
 *   node src/scripts/generateEmbeddings.js
 *   node src/scripts/generateEmbeddings.js --force
 *   node src/scripts/generateEmbeddings.js --batch-size=50
 */
const run = async () => {
  console.log("\n=======================================================");
  console.log("  AETHERA COMMERCE — CATALOG EMBEDDING INDEXER        ");
  console.log("=======================================================\n");

  const isForce = process.argv.includes("--force");
  const batchSizeArg = process.argv.find((arg) => arg.startsWith("--batch-size="));
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split("=")[1], 10) : 20;

  try {
    console.log("[Embedding CLI] Connecting to MongoDB...");
    await connectDB();

    const config = getEmbeddingConfig();
    console.log(`[Embedding CLI] Provider: ${config.provider.toUpperCase()}`);
    console.log(`[Embedding CLI] Model:    ${config.model}`);
    console.log(`[Embedding CLI] Dims:     ${config.dimensions}`);
    console.log(`[Embedding CLI] Force:    ${isForce ? "YES (re-embed all)" : "NO (skip unchanged)"}`);
    console.log(`[Embedding CLI] Batch:    ${batchSize}\n`);

    const startTime = Date.now();
    const summary = await generateProductEmbeddingsBatch({
      batchSize,
      force: isForce
    });

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("-------------------------------------------------------");
    console.log("  INDEXING COMPLETED SUCCESSFULLY                      ");
    console.log("-------------------------------------------------------");
    console.log(`  Total Evaluated:  ${summary.total}`);
    console.log(`  Vectors Updated:  ${summary.updated}`);
    console.log(`  Skipped (Cached): ${summary.skipped}`);
    console.log(`  Failed:           ${summary.failed}`);
    console.log(`  Execution Time:   ${elapsedSec}s`);
    console.log("-------------------------------------------------------\n");

    if (summary.errors && summary.errors.length > 0) {
      console.warn("[Embedding CLI] Errors encountered during batch:");
      summary.errors.forEach((err) => {
        console.warn(`  - Product [${err.productId}] ${err.name}: ${err.error}`);
      });
    }

    await mongoose.connection.close();
    console.log("[Embedding CLI] Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error(`\n[Embedding CLI Fatal Error] ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

run();
