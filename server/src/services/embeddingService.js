import crypto from "crypto";

/**
 * Supported embedding providers and their default dimension configurations.
 */
export const PROVIDER_CONFIGS = {
  openai: {
    defaultModel: "text-embedding-3-small",
    defaultDimensions: 1536,
    endpoint: "https://api.openai.com/v1/embeddings"
  },
  gemini: {
    defaultModel: "text-embedding-004",
    defaultDimensions: 768,
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models"
  },
  mock: {
    defaultModel: "aethera-mock-embedding",
    defaultDimensions: 1536
  }
};

let hasWarnedAboutMock = false;

/**
 * Resolves active provider, model, and dimension settings from environment variables.
 * Ensures secrets remain strictly on the backend.
 */
export const getEmbeddingConfig = () => {
  const envProvider = (process.env.EMBEDDING_PROVIDER || "").toLowerCase().trim();
  const apiKey = process.env.EMBEDDING_API_KEY || "";
  const model = process.env.EMBEDDING_MODEL || "";
  const dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS, 10);

  let provider = "mock";
  if (envProvider) {
    provider = envProvider;
  } else if (apiKey) {
    provider = "openai";
  } else if (process.env.NODE_ENV === "production") {
    // In production without an API key, warn clearly
    provider = "mock";
  }

  const baseConfig = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.mock;

  return {
    provider,
    apiKey,
    model: model || baseConfig.defaultModel,
    dimensions: !isNaN(dimensions) && dimensions > 0 ? dimensions : baseConfig.defaultDimensions
  };
};

/**
 * Deterministically generates a normalized pseudo-embedding vector for tests and offline development.
 * Words and semantic tokens are hashed and mapped to coordinates such that texts sharing vocabulary
 * produce vectors with meaningfully higher cosine similarity.
 *
 * @param {string} text - Input text
 * @param {number} dimensions - Vector dimensionality (default 1536)
 * @returns {Array<number>} Unit-length float array
 */
export const generateDeterministicMockEmbedding = (text, dimensions = 1536) => {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    tokens.push("empty");
  }

  // Map tokens into vector space using multi-hash projections
  for (const token of tokens) {
    const hash1 = crypto.createHash("md5").update(token).digest();
    const hash2 = crypto.createHash("sha256").update(token).digest();

    for (let i = 0; i < 8; i++) {
      const idx = (hash1.readUInt16BE((i * 2) % 14) + hash2.readUInt16BE((i * 2) % 30)) % dimensions;
      const weight = (hash2[i % 32] - 128) / 128.0;
      vector[idx] += weight;
    }
  }

  // Calculate L2 magnitude for normalization
  let sumSquares = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSquares += vector[i] * vector[i];
  }

  const magnitude = Math.sqrt(sumSquares) || 1.0;

  // Normalize to unit length (cosine similarity = dot product)
  for (let i = 0; i < dimensions; i++) {
    vector[i] = Number((vector[i] / magnitude).toFixed(6));
  }

  return vector;
};

/**
 * Calls OpenAI Embeddings API.
 */
const callOpenAIEmbeddings = async (text, config) => {
  if (!config.apiKey) {
    const error = new Error("OpenAI API key is missing. Set EMBEDDING_API_KEY in environment.");
    error.statusCode = 500;
    throw error;
  }

  const payload = {
    model: config.model,
    input: text
  };

  if (config.dimensions && config.model.includes("text-embedding-3")) {
    payload.dimensions = config.dimensions;
  }

  let response;
  try {
    response = await fetch(PROVIDER_CONFIGS.openai.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(payload)
    });
  } catch (netErr) {
    const error = new Error(`Network failure while contacting OpenAI Embeddings API: ${netErr.message}`);
    error.statusCode = 502;
    throw error;
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }

    const sanitizedErr = new Error(`OpenAI Embeddings API error (${response.status}): ${errorDetail}`);
    sanitizedErr.statusCode = response.status === 401 ? 401 : response.status === 429 ? 429 : 502;
    throw sanitizedErr;
  }

  const data = await response.json();
  const vector = data.data?.[0]?.embedding;

  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Invalid response format received from OpenAI Embeddings API.");
  }

  return vector;
};

/**
 * Calls Google Gemini Embeddings API.
 */
const callGeminiEmbeddings = async (text, config) => {
  if (!config.apiKey) {
    const error = new Error("Gemini API key is missing. Set EMBEDDING_API_KEY in environment.");
    error.statusCode = 500;
    throw error;
  }

  const url = `${PROVIDER_CONFIGS.gemini.endpoint}/${config.model}:embedContent?key=${encodeURIComponent(config.apiKey)}`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${config.model}`,
        content: { parts: [{ text }] }
      })
    });
  } catch (netErr) {
    const error = new Error(`Network failure while contacting Gemini Embeddings API: ${netErr.message}`);
    error.statusCode = 502;
    throw error;
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }

    const sanitizedErr = new Error(`Gemini Embeddings API error (${response.status}): ${errorDetail}`);
    sanitizedErr.statusCode = response.status;
    throw sanitizedErr;
  }

  const data = await response.json();
  const vector = data.embedding?.values;

  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Invalid response format received from Gemini Embeddings API.");
  }

  return vector;
};

/**
 * Universal, isolated embedding generation function.
 * Validates input, dispatches to configured provider, and returns numeric vector.
 *
 * @param {string} text - Searchable product or query text
 * @param {Object} [overrideConfig] - Optional test/custom config overrides
 * @returns {Promise<Array<number>>} High-dimensional vector array
 */
export const generateEmbedding = async (text, overrideConfig = {}) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    const error = new Error("Text input is required to generate an embedding.");
    error.statusCode = 400;
    throw error;
  }

  // Truncate to maximum safe context length (approx 8000 characters)
  const sanitizedText = text.trim().slice(0, 8000);
  const config = { ...getEmbeddingConfig(), ...overrideConfig };

  switch (config.provider) {
    case "openai":
      return callOpenAIEmbeddings(sanitizedText, config);

    case "gemini":
      return callGeminiEmbeddings(sanitizedText, config);

    case "mock":
    default:
      if (!hasWarnedAboutMock && process.env.NODE_ENV !== "test") {
        console.log(
          `[EmbeddingService] Using deterministic local mock provider (model: ${config.model}, dims: ${config.dimensions}). Configure EMBEDDING_API_KEY to use OpenAI/Gemini.`
        );
        hasWarnedAboutMock = true;
      }
      return generateDeterministicMockEmbedding(sanitizedText, config.dimensions);
  }
};

export default {
  generateEmbedding,
  getEmbeddingConfig,
  generateDeterministicMockEmbedding,
  PROVIDER_CONFIGS
};
