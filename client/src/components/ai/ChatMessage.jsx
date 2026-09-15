import React from "react";
import SourceProducts from "./SourceProducts.jsx";

/**
 * Formats basic markdown elements (bolding, lists, linebreaks) cleanly without heavy external parsers.
 */
function FormattedAssistantText({ text = "" }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-sm text-slate-200 leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }

        // Handle list item
        const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
        const isNumber = /^\d+\.\s/.test(line.trim());

        // Parse bold **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const parsedContent = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pIdx} className="font-semibold text-cyan-300">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-cyan-400 mt-1 text-xs">•</span>
              <span className="flex-1">{parsedContent}</span>
            </div>
          );
        }

        if (isNumber) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="flex-1">{parsedContent}</span>
            </div>
          );
        }

        return <p key={idx}>{parsedContent}</p>;
      })}
    </div>
  );
}

/**
 * Renders a single chat bubble (user or assistant) with grounded source references.
 */
export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 my-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md ${
          isUser
            ? "bg-gradient-to-tr from-amber-500 to-rose-500 text-white"
            : "bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white"
        }`}
      >
        {isUser ? "You" : "AI"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
          isUser
            ? "bg-gradient-to-r from-amber-600/90 to-amber-700/90 text-white rounded-tr-none border border-amber-500/30"
            : "bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/70"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div>
            <FormattedAssistantText text={message.content} />
            {message.sources && message.sources.length > 0 && (
              <SourceProducts sources={message.sources} />
            )}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-1.5 ${
            isUser ? "text-amber-200/70 text-right" : "text-slate-400"
          }`}
        >
          {message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            : ""}
        </div>
      </div>
    </div>
  );
}
