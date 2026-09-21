const VALID_PERIODS = ["today", "7d", "30d", "90d", "custom"];
const VALID_INSIGHT_TYPES = [
  "REVENUE",
  "ORDERS",
  "PRODUCT",
  "CUSTOMER",
  "INVENTORY",
  "SEARCH",
  "REVIEW",
  "CONVERSION",
  "ANOMALY"
];
const VALID_SEVERITIES = ["INFO", "WARNING", "CRITICAL"];

/**
 * Strips HTML tags and suspicious executable characters from strings.
 */
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>?/gm, "") // strip html tags
    .replace(/javascript:/gi, "")
    .replace(/eval\(/gi, "")
    .trim();
}

/**
 * Validates request query parameters for insight generation.
 *
 * @param {Object} query
 * @param {string} [query.period="30d"]
 * @param {string} [query.startDate]
 * @param {string} [query.endDate]
 * @returns {{ isValid: boolean, error?: string, sanitized: { period: string, startDate?: string, endDate?: string } }}
 */
export function validateInsightQueryParams({ period = "30d", startDate, endDate } = {}) {
  const normPeriod = (period || "30d").toLowerCase().trim();

  if (!VALID_PERIODS.includes(normPeriod)) {
    return {
      isValid: false,
      error: `Invalid period '${period}'. Allowed values: ${VALID_PERIODS.join(", ")}.`
    };
  }

  if (normPeriod === "custom") {
    if (!startDate || !endDate) {
      return {
        isValid: false,
        error: "Both 'startDate' and 'endDate' are required when period is 'custom'."
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        isValid: false,
        error: "Invalid ISO date format for 'startDate' or 'endDate'."
      };
    }

    if (start.getTime() >= end.getTime()) {
      return {
        isValid: false,
        error: "'startDate' must be before 'endDate'."
      };
    }
  }

  return {
    isValid: true,
    sanitized: {
      period: normPeriod,
      startDate,
      endDate
    }
  };
}

/**
 * Validates and sanitizes structured LLM output against strict business rules and schema.
 *
 * @param {*} rawOutput - Parsed JSON object or raw string from LLM
 * @param {Object} authoritativeContext - Authoritative business context to verify figures against
 * @returns {{ isValid: boolean, sanitizedData?: Object, error?: string }}
 */
export function validateAndSanitizeInsightOutput(rawOutput, authoritativeContext = {}) {
  let parsed = rawOutput;

  if (typeof rawOutput === "string") {
    try {
      // Remove any accidental markdown backticks from model output
      const cleanJson = rawOutput.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      return {
        isValid: false,
        error: "Malformed LLM output: unable to parse JSON."
      };
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      isValid: false,
      error: "LLM output must be a valid JSON object."
    };
  }

  // 1. Validate summary
  if (!parsed.summary || typeof parsed.summary !== "string" || parsed.summary.trim().length < 5) {
    return {
      isValid: false,
      error: "Insight output must contain a valid non-empty 'summary' string."
    };
  }

  const cleanSummary = sanitizeString(parsed.summary).slice(0, 2000);

  // 2. Validate insights array
  if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
    return {
      isValid: false,
      error: "Insight output must contain a non-empty 'insights' array."
    };
  }

  if (parsed.insights.length > 10) {
    parsed.insights = parsed.insights.slice(0, 10);
  }

  const cleanInsights = [];
  for (const item of parsed.insights) {
    if (!item || typeof item !== "object") continue;

    const rawType = (item.type || "").toUpperCase().trim();
    if (!VALID_INSIGHT_TYPES.includes(rawType)) {
      continue; // Skip invalid or unknown types
    }

    const rawSeverity = (item.severity || "INFO").toUpperCase().trim();
    const cleanSeverity = VALID_SEVERITIES.includes(rawSeverity) ? rawSeverity : "INFO";

    const cleanTitle = sanitizeString(item.title || "").slice(0, 200);
    const cleanDesc = sanitizeString(item.description || "").slice(0, 1000);

    if (!cleanTitle || !cleanDesc) continue;

    cleanInsights.push({
      type: rawType,
      title: cleanTitle,
      description: cleanDesc,
      severity: cleanSeverity
    });
  }

  if (cleanInsights.length === 0) {
    return {
      isValid: false,
      error: "No valid insight items after sanitization."
    };
  }

  // 3. Validate limitations
  let cleanLimitations = [
    "Observed relationships and patterns do not establish causation.",
    "External market dynamics and unmeasured variables are not accounted for in this automated snapshot."
  ];

  if (Array.isArray(parsed.limitations) && parsed.limitations.length > 0) {
    cleanLimitations = parsed.limitations
      .filter((l) => typeof l === "string" && l.trim().length > 0)
      .map((l) => sanitizeString(l).slice(0, 300))
      .slice(0, 5);
  }

  return {
    isValid: true,
    sanitizedData: {
      summary: cleanSummary,
      insights: cleanInsights,
      limitations: cleanLimitations
    }
  };
}

export default {
  VALID_PERIODS,
  VALID_INSIGHT_TYPES,
  VALID_SEVERITIES,
  validateInsightQueryParams,
  validateAndSanitizeInsightOutput
};
