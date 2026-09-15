import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import aiService from "../../services/aiService.js";

/**
 * Send customer query to the grounded AI assistant.
 */
export const sendChatMessage = createAsyncThunk(
  "ai/sendChatMessage",
  async ({ message, sessionId }, { rejectWithValue }) => {
    try {
      const data = await aiService.sendMessage({ message, sessionId });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to get response from AI assistant");
    }
  }
);

/**
 * Fetch all previous chat sessions for the customer.
 */
export const fetchAiSessions = createAsyncThunk(
  "ai/fetchAiSessions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await aiService.getSessions();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load chat history");
    }
  }
);

/**
 * Load messages from an existing chat session.
 */
export const loadAiSession = createAsyncThunk(
  "ai/loadAiSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const session = await aiService.getSessionById(sessionId);
      return session;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load session details");
    }
  }
);

/**
 * Delete a specific chat session.
 */
export const deleteAiSession = createAsyncThunk(
  "ai/deleteAiSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await aiService.deleteSession(sessionId);
      return sessionId;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete session");
    }
  }
);

const initialState = {
  isOpen: false,
  activeSessionId: null,
  messages: [],
  sessions: [],
  isLoading: false,
  sessionsLoading: false,
  error: null
};

export const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    toggleAssistant: (state) => {
      state.isOpen = !state.isOpen;
      state.error = null;
    },
    openAssistant: (state) => {
      state.isOpen = true;
      state.error = null;
    },
    closeAssistant: (state) => {
      state.isOpen = false;
    },
    startNewChat: (state) => {
      state.activeSessionId = null;
      state.messages = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // sendChatMessage
      .addCase(sendChatMessage.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        // Optimistically add user query to current message list
        state.messages.push({
          role: "user",
          content: action.meta.arg.message,
          createdAt: new Date().toISOString()
        });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSessionId = action.payload.sessionId;
        state.messages.push({
          role: "assistant",
          content: action.payload.message,
          sources: action.payload.sources || [],
          createdAt: new Date().toISOString()
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchAiSessions
      .addCase(fetchAiSessions.pending, (state) => {
        state.sessionsLoading = true;
      })
      .addCase(fetchAiSessions.fulfilled, (state, action) => {
        state.sessionsLoading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchAiSessions.rejected, (state) => {
        state.sessionsLoading = false;
      })

      // loadAiSession
      .addCase(loadAiSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAiSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSessionId = action.payload._id;
        state.messages = action.payload.messages || [];
      })
      .addCase(loadAiSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // deleteAiSession
      .addCase(deleteAiSession.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.sessions = state.sessions.filter((s) => s._id !== deletedId);
        if (state.activeSessionId === deletedId) {
          state.activeSessionId = null;
          state.messages = [];
        }
      });
  }
});

export const {
  toggleAssistant,
  openAssistant,
  closeAssistant,
  startNewChat,
  clearError
} = aiSlice.actions;

export default aiSlice.reducer;
