/**
 * Service providing LLM interaction abstraction for Aethera Commerce.
 * Supports Google Gemini, OpenAI, and a deterministic Mock provider for local development/testing.
 * Guarantees that source references are strictly cross-verified against retrieved catalog products.
 */

class AiService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || "mock";
    this.apiKey = process.env.LLM_API_KEY || "";
    this.model = process.env.LLM_MODEL || (this.provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini");
  }

  /**
   * Generates a grounded shopping response using the configured LLM provider or local mock.
   *
   * @param {Object} params
   * @param {string} params.systemPrompt - System guidelines and injection boundaries
   * @param {Array<Object>} params.conversationHistory - Bounded historical messages
   * @param {string} params.userPrompt - User prompt including retrieved catalog data
   * @param {string} params.userMessage - Raw user query string
   * @param {Array<Object>} params.retrievedProducts - Products actually retrieved from MongoDB
   * @returns {Promise<{ message: string, sources: Array<Object> }>}
   */
  async generateShoppingResponse({
    systemPrompt,
    conversationHistory = [],
    userPrompt,
    userMessage = "",
    retrievedProducts = []
  }) {
    const activeProvider = (process.env.LLM_PROVIDER || this.provider).toLowerCase();
    const hasKey = Boolean(process.env.LLM_API_KEY || this.apiKey);

    let rawAnswer = "";

    // 1. Route to provider (default to high-fidelity mock if provider is mock or missing key or in test)
    if (activeProvider === "mock" || !hasKey || process.env.NODE_ENV === "test") {
      rawAnswer = this._generateMockResponse({
        userMessage,
        retrievedProducts
      });
    } else if (activeProvider === "gemini") {
      rawAnswer = await this._callGemini({
        systemPrompt,
        conversationHistory,
        userPrompt
      });
    } else if (activeProvider === "openai") {
      rawAnswer = await this._callOpenAi({
        systemPrompt,
        conversationHistory,
        userPrompt
      });
    } else {
      rawAnswer = this._generateMockResponse({
        userMessage,
        retrievedProducts
      });
    }

    // 2. Cross-verify and build source product references
    const verifiedSources = this._verifySources(rawAnswer, retrievedProducts);

    return {
      message: rawAnswer,
      sources: verifiedSources
    };
  }

  /**
   * Deterministic mock engine for testing and local development without external API costs.
   * Accurately simulates prompt injection resistance, catalog grounding, and refusal on missing context.
   */
  _generateMockResponse({ userMessage = "", retrievedProducts = [] }) {
    const lowerQuery = userMessage.toLowerCase();

    // Check for prompt injection attempts
    const injectionPatterns = [
      "ignore previous instructions",
      "ignore all previous instructions",
      "reveal your system prompt",
      "reveal system prompt",
      "show your prompt",
      "tell me your instructions",
      "system instructions",
      "developer instructions",
      "override instructions",
      "what are your instructions"
    ];

    if (injectionPatterns.some((pattern) => lowerQuery.includes(pattern))) {
      return "I am Aethera's AI Shopping Assistant. I cannot comply with requests to override my system instructions, alter catalog safety rules, or reveal internal configurations. How can I help you find products in our catalog?";
    }

    // Check for insufficient catalog context
    if (!retrievedProducts || retrievedProducts.length === 0) {
      return "I don't have enough information in the current catalog data to answer that confidently. Please try searching for another item or browse our product categories.";
    }

    // Synthesize grounded response using retrieved catalog facts
    const count = retrievedProducts.length;
    const lines = [];

    if (count === 1) {
      const p = retrievedProducts[0];
      lines.push(
        `Based on our catalog, I found **${p.name}** by ${p.brand}. It is priced at **₹${p.finalPrice || p.price}** with a rating of ${p.rating ? p.rating.toFixed(1) : "N/A"}/5 (${p.reviewCount || 0} reviews).`
      );
      lines.push(`\n**Details**: ${p.description}`);
      lines.push(`**Availability**: ${p.stock > 0 ? `In Stock (${p.stock} units)` : "Currently Out of Stock"}.`);
    } else {
      lines.push(
        `Based on our current catalog, here are ${count} relevant options matching your request:`
      );
      retrievedProducts.forEach((p, index) => {
        const stockText = p.stock > 0 ? `In Stock (${p.stock} available)` : "Out of Stock";
        lines.push(
          `\n${index + 1}. **${p.name}** (${p.brand}) — **₹${p.finalPrice || p.price}**` +
            `\n   - Rating: ${p.rating ? p.rating.toFixed(1) : "0.0"}/5 (${p.reviewCount || 0} reviews)` +
            `\n   - Stock: ${stockText}` +
            `\n   - ${p.description.slice(0, 140)}${p.description.length > 140 ? "..." : ""}`
        );
      });
      lines.push("\nLet me know if you would like more details or comparisons on any of these products!");
    }

    return lines.join("\n");
  }

  /**
   * Calls Google Gemini REST API with bounded parameters.
   */
  async _callGemini({ systemPrompt, conversationHistory, userPrompt }) {
    const apiKey = process.env.LLM_API_KEY || this.apiKey;
    const model = process.env.LLM_MODEL || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = [];

    // Add historical conversation
    conversationHistory.forEach((msg) => {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    });

    // Add current query with context
    contents.push({
      role: "user",
      parts: [{ text: userPrompt }]
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AiService] Gemini API error (${response.status}):`, errorText.slice(0, 200));
        throw new Error("AI provider returned an error.");
      }

      const data = await response.json();
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) {
        throw new Error("No response generated by AI model.");
      }

      return candidate.trim();
    } catch (err) {
      console.error("[AiService] Gemini request failure:", err.message);
      const customErr = new Error("AI assistant is temporarily unavailable. Please try again shortly.");
      customErr.statusCode = 503;
      throw customErr;
    }
  }

  /**
   * Calls OpenAI-compatible REST API.
   */
  async _callOpenAi({ systemPrompt, conversationHistory, userPrompt }) {
    const apiKey = process.env.LLM_API_KEY || this.apiKey;
    const model = process.env.LLM_MODEL || "gpt-4o-mini";
    const url = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";

    const messages = [{ role: "system", content: systemPrompt }];

    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      });
    });

    messages.push({ role: "user", content: userPrompt });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AiService] OpenAI API error (${response.status}):`, errorText.slice(0, 200));
        throw new Error("AI provider returned an error.");
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      if (!answer) {
        throw new Error("No response generated by OpenAI model.");
      }

      return answer.trim();
    } catch (err) {
      console.error("[AiService] OpenAI request failure:", err.message);
      const customErr = new Error("AI assistant is temporarily unavailable. Please try again shortly.");
      customErr.statusCode = 503;
      throw customErr;
    }
  }

  /**
   * Generates a structured review summary (summary narrative, overall sentiment, and themes)
   * grounded in retrieved customer reviews using the configured LLM or deterministic mock.
   *
   * @param {Object} params
   * @param {string} params.systemPrompt - System guidelines and injection boundaries
   * @param {string} params.userPrompt - User prompt containing <reviews_reference_data>
   * @param {Array<Object>} params.reviews - Representative reviews used for grounding
   * @param {number} params.reviewCount - Total approved reviews in store
   * @returns {Promise<{ summary: string, sentiment: 'positive'|'mixed'|'negative', themes: Array<Object> }>}
   */
  async generateStructuredReviewSummary({
    systemPrompt,
    userPrompt,
    reviews = [],
    reviewCount = 0
  }) {
    const activeProvider = (process.env.LLM_PROVIDER || this.provider).toLowerCase();
    const hasKey = Boolean(process.env.LLM_API_KEY || this.apiKey);

    let rawJson = "";

    if (activeProvider === "mock" || !hasKey || process.env.NODE_ENV === "test") {
      const mockResult = this._generateMockReviewSummary({ reviews, reviewCount });
      return this.validateReviewSummaryOutput(mockResult);
    } else if (activeProvider === "gemini") {
      rawJson = await this._callGeminiForJson({
        systemPrompt,
        userPrompt
      });
    } else if (activeProvider === "openai") {
      rawJson = await this._callOpenAiForJson({
        systemPrompt,
        userPrompt
      });
    } else {
      const mockResult = this._generateMockReviewSummary({ reviews, reviewCount });
      return this.validateReviewSummaryOutput(mockResult);
    }

    // Parse and validate structured output
    let parsed;
    try {
      // Clean possible markdown fences
      const cleanJson = rawJson.replace(/```json\s*|\s*```/gi, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn("[AiService] Failed to parse JSON directly, attempting regex extraction:", parseErr.message);
      const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI provider failed to return a valid JSON review summary.");
      }
    }

    return this.validateReviewSummaryOutput(parsed);
  }

  /**
   * Deterministic mock review summarizer for testing and local development.
   * Analyzes actual customer reviews, detects sentiments and common themes,
   * handles prompt injection safely as data, and formats a grounded response.
   */
  _generateMockReviewSummary({ reviews = [], reviewCount = 0 }) {
    if (!reviews || reviews.length === 0) {
      return {
        summary: "There are currently no approved reviews available for this product.",
        sentiment: "mixed",
        themes: []
      };
    }

    // Calculate rating metrics
    let posCount = 0;
    let mixedCount = 0;
    let negCount = 0;

    reviews.forEach((r) => {
      const rating = Number(r.rating) || 3;
      if (rating >= 4) posCount++;
      else if (rating === 3) mixedCount++;
      else negCount++;
    });

    const total = reviews.length;
    let overallSentiment = "positive";
    if (negCount / total >= 0.35) {
      overallSentiment = "negative";
    } else if (mixedCount / total >= 0.3 || (negCount > 0 && posCount > 0)) {
      overallSentiment = "mixed";
    }

    // Inspect actual review text for themes
    const allText = reviews.map((r) => r.comment || "").join(" ").toLowerCase();

    // Candidate themes dictionary with keywords and default sentiment detection
    const candidates = [
      {
        name: "Comfort",
        keywords: ["comfort", "comfortable", "cushion", "cushioning", "soft", "padding"],
        detected: false,
        ratings: []
      },
      {
        name: "Fit & Sizing",
        keywords: ["fit", "sizing", "size", "narrow", "wide", "tight", "loose", "true to size"],
        detected: false,
        ratings: []
      },
      {
        name: "Build Quality",
        keywords: ["quality", "durability", "durable", "material", "build", "finish", "solid"],
        detected: false,
        ratings: []
      },
      {
        name: "Performance",
        keywords: ["performance", "speed", "responsive", "marathon", "running", "grip", "traction"],
        detected: false,
        ratings: []
      },
      {
        name: "Battery Life",
        keywords: ["battery", "charge", "charging", "standby", "battery life"],
        detected: false,
        ratings: []
      },
      {
        name: "Value",
        keywords: ["price", "value", "worth", "expensive", "deal", "affordable"],
        detected: false,
        ratings: []
      }
    ];

    candidates.forEach((cand) => {
      reviews.forEach((r) => {
        const text = (r.comment || "").toLowerCase();
        if (cand.keywords.some((kw) => text.includes(kw))) {
          cand.detected = true;
          cand.ratings.push(Number(r.rating) || 3);
        }
      });
    });

    // Build themes list
    const detectedThemes = candidates
      .filter((c) => c.detected)
      .map((c) => {
        const avg = c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length;
        let s = "positive";
        if (avg < 2.8) s = "negative";
        else if (avg <= 3.7) s = "mixed";

        return {
          name: c.name,
          sentiment: s,
          evidenceCount: c.ratings.length
        };
      })
      .slice(0, 4);

    // If no specific theme keywords detected, generate generic fallback themes
    if (detectedThemes.length === 0) {
      if (posCount > 0) {
        detectedThemes.push({
          name: "General Satisfaction",
          sentiment: "positive",
          evidenceCount: posCount
        });
      }
      if (negCount > 0) {
        detectedThemes.push({
          name: "Critical Feedback",
          sentiment: "negative",
          evidenceCount: negCount
        });
      }
      if (mixedCount > 0 && detectedThemes.length < 3) {
        detectedThemes.push({
          name: "Average Experience",
          sentiment: "mixed",
          evidenceCount: mixedCount
        });
      }
    }

    // Build grounded narrative
    const prefix =
      reviewCount < 5
        ? "Based on early customer feedback, "
        : "Customers generally report ";

    const positiveThemes = detectedThemes.filter((t) => t.sentiment === "positive");
    const mixedThemes = detectedThemes.filter((t) => t.sentiment === "mixed");
    const negativeThemes = detectedThemes.filter((t) => t.sentiment === "negative");

    const sentences = [];

    if (positiveThemes.length > 0) {
      const names = positiveThemes.map((t) => t.name.toLowerCase()).join(" and ");
      sentences.push(
        `${prefix}strong satisfaction with ${names}.`
      );
    } else {
      sentences.push(`${prefix}mixed sentiment across the product experience.`);
    }

    if (mixedThemes.length > 0) {
      const mixedNames = mixedThemes.map((t) => t.name.toLowerCase()).join(" and ");
      sentences.push(
        `Reviews offer differing opinions regarding ${mixedNames}.`
      );
    }

    if (negativeThemes.length > 0) {
      const negNames = negativeThemes.map((t) => t.name.toLowerCase()).join(" and ");
      sentences.push(
        `A portion of reviewers note reservations concerning ${negNames}.`
      );
    }

    // Check if comments specifically mention marathon or long distance running
    if (allText.includes("marathon") || allText.includes("long-distance") || allText.includes("long distance")) {
      sentences.push("Several reviews specifically highlight reliable performance for marathon and distance use.");
    }
    if (allText.includes("narrow") || allText.includes("tight")) {
      sentences.push("Some customers mention that the fit feels slightly narrow.");
    }

    const summary = sentences.join(" ");

    return {
      summary,
      sentiment: overallSentiment,
      themes: detectedThemes
    };
  }

  /**
   * Calls Google Gemini with JSON enforcement.
   */
  async _callGeminiForJson({ systemPrompt, userPrompt }) {
    const apiKey = process.env.LLM_API_KEY || this.apiKey;
    const model = process.env.LLM_MODEL || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AiService] Gemini JSON error (${response.status}):`, errorText.slice(0, 200));
      throw new Error("AI provider returned an error while summarizing reviews.");
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error("No review summary generated by AI model.");
    }

    return candidate.trim();
  }

  /**
   * Calls OpenAI-compatible API with JSON mode.
   */
  async _callOpenAiForJson({ systemPrompt, userPrompt }) {
    const apiKey = process.env.LLM_API_KEY || this.apiKey;
    const model = process.env.LLM_MODEL || "gpt-4o-mini";
    const url = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AiService] OpenAI JSON error (${response.status}):`, errorText.slice(0, 200));
      throw new Error("AI provider returned an error while summarizing reviews.");
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
      throw new Error("No review summary generated by OpenAI model.");
    }

    return answer.trim();
  }

  /**
   * Validates and sanitizes structured review summary output from any provider.
   * Enforces strict schema constraints, removes HTML tags, limits themes count,
   * and verifies sentiment values.
   *
   * @param {Object} raw
   * @returns {{ summary: string, sentiment: 'positive'|'mixed'|'negative', themes: Array<Object> }}
   */
  validateReviewSummaryOutput(raw = {}) {
    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid review summary payload: must be an object.");
    }

    // Helper to strip HTML tags and scripts
    const stripHtml = (str) =>
      typeof str === "string" ? str.replace(/<[^>]*>?/gm, "").trim() : "";

    // 1. Validate summary string
    let summary = stripHtml(raw.summary);
    if (!summary) {
      summary = "Customers have shared feedback on this product.";
    }
    if (summary.length > 2000) {
      summary = summary.slice(0, 1997) + "...";
    }

    // 2. Validate sentiment enum
    const validSentiments = ["positive", "mixed", "negative"];
    let sentiment = typeof raw.sentiment === "string" ? raw.sentiment.toLowerCase().trim() : "mixed";
    if (!validSentiments.includes(sentiment)) {
      sentiment = "mixed";
    }

    // 3. Validate themes array
    let rawThemes = Array.isArray(raw.themes) ? raw.themes : [];
    // Limit to max 6 themes
    rawThemes = rawThemes.slice(0, 6);

    const validatedThemes = [];
    for (const t of rawThemes) {
      if (!t || typeof t !== "object") continue;

      const name = stripHtml(t.name);
      if (!name) continue;

      let themeSentiment = typeof t.sentiment === "string" ? t.sentiment.toLowerCase().trim() : "mixed";
      if (!validSentiments.includes(themeSentiment)) {
        themeSentiment = "mixed";
      }

      const item = {
        name: name.slice(0, 40),
        sentiment: themeSentiment
      };

      if (typeof t.evidenceCount === "number" && t.evidenceCount >= 0) {
        item.evidenceCount = Math.floor(t.evidenceCount);
      }

      validatedThemes.push(item);
    }

    return {
      summary,
      sentiment,
      themes: validatedThemes
    };
  }

  /**
   * Cross-verifies referenced products against retrieved products.
   * Only products that were legitimately retrieved from MongoDB can be returned as sources.
   *
   * @param {string} answer - Generated assistant answer
   * @param {Array<Object>} retrievedProducts - Actual products from database
   * @returns {Array<Object>} Sanitized list of source product cards
   */
  _verifySources(answer, retrievedProducts = []) {
    if (!Array.isArray(retrievedProducts) || retrievedProducts.length === 0) {
      return [];
    }

    const lowerAnswer = (answer || "").toLowerCase();

    // Find all retrieved products that are referenced in the answer, or if the answer is a general list,
    // include the top retrieved products that ground the answer.
    const matched = retrievedProducts.filter((p) => {
      const nameMatch = p.name && lowerAnswer.includes(p.name.toLowerCase());
      const idMatch = p._id && lowerAnswer.includes(p._id.toString().toLowerCase());
      return nameMatch || idMatch;
    });

    // If specific names were matched, use them; otherwise, if the assistant discussed the catalog,
    // ground it with the top retrieved candidates (up to 4).
    const finalProducts = matched.length > 0 ? matched : retrievedProducts.slice(0, 4);

    return finalProducts.map((p) => {
      const primaryImg =
        p.images && p.images.length > 0
          ? typeof p.images[0] === "string"
            ? p.images[0]
            : p.images[0].url
          : null;

      return {
        type: "product",
        productId: p._id,
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        price: p.price,
        discount: p.discount || 0,
        finalPrice: p.finalPrice || p.price,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        stock: p.stock,
        image: primaryImg,
        images: p.images || []
      };
    });
  }
}

export const aiService = new AiService();
export default aiService;

