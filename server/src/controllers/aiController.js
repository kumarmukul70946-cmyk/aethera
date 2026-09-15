import mongoose from "mongoose";
import { ChatSession } from "../models/index.js";
import ragService from "../services/ragService.js";
import contextBuilder from "../services/contextBuilder.js";
import promptService from "../services/promptService.js";
import aiService from "../services/aiService.js";
import { interactionService } from "../services/interactionService.js";

/**
 * Handles incoming customer shopping chat requests with grounded RAG workflow.
 * @route POST /api/ai/chat
 * @access Private (Customer/Admin)
 */
export const chat = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;

    // 1. Resolve or create ChatSession strictly owned by the authenticated user
    let session = null;
    if (sessionId) {
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID format"
        });
      }

      session = await ChatSession.findOne({ _id: sessionId, user: userId });
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Chat session not found or access denied"
        });
      }
    } else {
      // Create a fresh session with a title derived from the initial user inquiry
      const cleanTitle = message.trim().slice(0, 45) + (message.trim().length > 45 ? "..." : "");
      session = new ChatSession({
        user: userId,
        title: cleanTitle,
        messages: []
      });
    }

    // 2. Retrieval step: query products & approved reviews from MongoDB Atlas Vector Search
    const { products, reviews } = await ragService.retrieveRelevantContext(message, {
      productLimit: 5,
      reviewLimit: 6
    });

    // 3. Build compact, injection-defended text context
    const context = contextBuilder.buildRagContext(products, reviews);

    // 4. Construct prompt with system grounding rules and bounded history
    const { systemPrompt, conversationHistory, userPrompt } =
      promptService.buildShoppingAssistantPrompt({
        context,
        conversationHistory: session.messages,
        userMessage: message
      });

    // 5. Query LLM provider abstraction (OpenAI, Gemini, or deterministic Mock)
    const response = await aiService.generateShoppingResponse({
      systemPrompt,
      conversationHistory,
      userPrompt,
      userMessage: message,
      retrievedProducts: products
    });

    // 6. Persist user inquiry and assistant response into ChatSession
    session.messages.push({
      role: "user",
      content: message.trim(),
      createdAt: new Date()
    });

    session.messages.push({
      role: "assistant",
      content: response.message,
      sources: response.sources || [],
      createdAt: new Date()
    });

    await session.save();

    // 7. Track customer search/query interaction asynchronously (non-blocking)
    try {
      interactionService
        .createInteraction({
          userId,
          type: "SEARCH",
          metadata: {
            source: "ai_assistant",
            query: message.trim().slice(0, 100)
          }
        })
        .catch(() => {});
    } catch (_) {
      // Ignore analytics logging failures
    }

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        message: response.message,
        sources: response.sources
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lists all active chat sessions belonging to the authenticated user.
 * @route GET /api/ai/sessions
 * @access Private
 */
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sessions = await ChatSession.find({ user: userId })
      .sort({ updatedAt: -1 })
      .select("title updatedAt createdAt messages")
      .lean();

    // Transform sessions to include message count and last message preview
    const summaries = sessions.map((s) => ({
      _id: s._id,
      title: s.title,
      messageCount: s.messages ? s.messages.length : 0,
      lastMessage:
        s.messages && s.messages.length > 0
          ? s.messages[s.messages.length - 1].content.slice(0, 60)
          : null,
      updatedAt: s.updatedAt,
      createdAt: s.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: { sessions: summaries }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves full message history for a specific chat session.
 * @route GET /api/ai/sessions/:id
 * @access Private
 */
export const getSessionById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const session = await ChatSession.findOne({ _id: id, user: userId }).lean();
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found or access denied"
      });
    }

    return res.status(200).json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a chat session owned by the authenticated user.
 * @route DELETE /api/ai/sessions/:id
 * @access Private
 */
export const deleteSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await ChatSession.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found or access denied"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat session deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export default {
  chat,
  getSessions,
  getSessionById,
  deleteSession
};
