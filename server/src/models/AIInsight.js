import mongoose from "mongoose";

const insightItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Insight type is required"],
      enum: {
        values: [
          "REVENUE",
          "ORDERS",
          "PRODUCT",
          "CUSTOMER",
          "INVENTORY",
          "SEARCH",
          "REVIEW",
          "CONVERSION",
          "ANOMALY"
        ],
        message: "{VALUE} is not a valid insight type"
      }
    },
    title: {
      type: String,
      required: [true, "Insight title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    description: {
      type: String,
      required: [true, "Insight description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    severity: {
      type: String,
      required: [true, "Insight severity is required"],
      enum: {
        values: ["INFO", "WARNING", "CRITICAL"],
        message: "{VALUE} is not a valid severity level"
      },
      default: "INFO"
    }
  },
  { _id: false }
);

const aiInsightSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "PERIODIC_ANALYSIS",
      trim: true
    },
    period: {
      type: String,
      required: [true, "Analysis period is required"],
      enum: ["today", "7d", "30d", "90d", "custom"]
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    metricsSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Authoritative metrics snapshot is required"]
    },
    summary: {
      type: String,
      required: [true, "Executive summary is required"],
      trim: true,
      maxlength: [2000, "Summary cannot exceed 2000 characters"]
    },
    insights: {
      type: [insightItemSchema],
      default: []
    },
    limitations: {
      type: [String],
      default: [
        "The analysis describes observed trends and correlations and does not establish causation.",
        "External marketing conditions, seasonality, and unobserved variables are not factored into this automated interpretation."
      ]
    },
    sourceHash: {
      type: String,
      required: [true, "Metrics source hash is required"],
      index: true
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    model: {
      type: String,
      default: "gemini-1.5-flash"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high-performance cache lookups and historical reviews
aiInsightSchema.index({ period: 1, sourceHash: 1 });
aiInsightSchema.index({ period: 1, generatedAt: -1 });

const AIInsight = mongoose.model("AIInsight", aiInsightSchema);

export default AIInsight;
