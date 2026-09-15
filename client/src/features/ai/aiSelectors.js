/**
 * Selectors for the AI Shopping Assistant feature state.
 */
export const selectAiIsOpen = (state) => state.ai.isOpen;
export const selectAiActiveSessionId = (state) => state.ai.activeSessionId;
export const selectAiMessages = (state) => state.ai.messages;
export const selectAiSessions = (state) => state.ai.sessions;
export const selectAiIsLoading = (state) => state.ai.isLoading;
export const selectAiSessionsLoading = (state) => state.ai.sessionsLoading;
export const selectAiError = (state) => state.ai.error;
