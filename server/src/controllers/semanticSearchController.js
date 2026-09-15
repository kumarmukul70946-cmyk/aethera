import semanticSearchService from "../services/semanticSearchService.js";
import { interactionService } from "../services/interactionService.js";

/**
 * Executes semantic product search.
 * Supports natural language query, structured metadata filters, and pagination.
 * Asynchronously tracks SEARCH interactions for authenticated customers.
 *
 * @route GET /api/search/semantic
 * @access Public
 */
export const searchSemantic = async (req, res, next) => {
  try {
    const result = await semanticSearchService.searchSemantic(req.query);

    // Asynchronous, non-blocking interaction analytics for authenticated users
    if (req.user?._id) {
      interactionService
        .createInteraction({
          userId: req.user._id,
          type: "SEARCH",
          metadata: {
            query: result.query,
            source: "semantic_search",
            searchMode: result.searchMode,
            totalResults: result.pagination?.total || 0,
            page: result.pagination?.page || 1
          }
        })
        .catch((trackErr) => {
          // Failure in analytics must never degrade or block customer search
          if (process.env.NODE_ENV !== "test") {
            console.warn(
              "[SemanticSearch] Non-critical interaction analytics notice:",
              trackErr.message
            );
          }
        });
    }

    res.status(200).json({
      success: true,
      message: "Semantic search completed successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  searchSemantic
};
