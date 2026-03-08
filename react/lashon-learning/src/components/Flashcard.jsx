import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { sanitizeHtml, toSefariaUrl } from "../utils/sefaria";

export default function Flashcard({
  word,
  definition,
  sources = [],
  className = "",
  frontMode = "word",
}) {
  const [showBack, setShowBack] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);

  // 1. Safely check if sources exist (handles Array or Object)
  const hasSources = useMemo(() => {
    if (!sources) return false;
    if (Array.isArray(sources)) return sources.length > 0;
    if (typeof sources === "object") return Object.keys(sources).length > 0;
    return false;
  }, [sources]);

  const isWordFirst = frontMode === "word";
  const frontLabel = isWordFirst ? "Word" : "Definition";
  const backLabel = isWordFirst ? "Definition" : "Word";

  // Use String() to ensure we never pass an object directly to React children
  const frontContent = isWordFirst
    ? String(word || "")
    : String(definition || "");
  const backContent = isWordFirst
    ? String(definition || "")
    : String(word || "");

  return (
    <div className={`w-full max-w-2xl ${className} h-fit`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowBack((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setShowBack((prev) => !prev);
        }}
        className="flashcard group relative h-80 sm:h-100 w-full rounded-3xl text-left outline-none transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] cursor-pointer touch-manipulation"
      >
        {/* Card background styling */}
        <div className="absolute inset-0 rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-2 ring-black/5" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-zinc-50 to-zinc-100" />

        {/* --- FRONT SIDE --- */}
        <div
          className={`flashcard-content absolute inset-0 flex flex-col justify-between rounded-3xl p-4 sm:p-8 transition-opacity duration-300 ${
            showBack ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary">
              {frontLabel}
            </span>
            <span className="text-xs text-zinc-400">Click to reveal</span>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4">
            <h2
              className={`text-center font-bold text-zinc-900 ${isWordFirst ? "text-3xl sm:text-5xl" : "text-xl sm:text-2xl"}`}
              dir={isWordFirst ? "rtl" : "ltr"}
            >
              {frontContent}
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to={`/wordlist/${encodeURIComponent(word)}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-primary/40 hover:text-primary hover:bg-primary/5"
            >
              <BookOpen size={12} />
              Explore
            </Link>
            <span className="text-xs text-zinc-400 uppercase tracking-widest">
              Flashcard
            </span>
          </div>
        </div>

        {/* --- BACK SIDE --- */}
        <div
          className={`flashcard-content absolute inset-0 flex flex-col rounded-3xl p-4 sm:p-8 transition-opacity duration-300 ${
            showBack ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium tracking-wide text-sky-700">
              {backLabel}
            </span>
            <span className="text-xs text-zinc-400">Click to go back</span>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex items-center justify-center py-4">
              <h2
                className={`text-center font-semibold text-zinc-900 ${!isWordFirst ? "text-3xl sm:text-5xl" : "text-xl sm:text-2xl"}`}
                dir={!isWordFirst ? "rtl" : "ltr"}
              >
                {backContent}
              </h2>
            </div>

            {/* Sources Section */}
            {hasSources && (
              <div className="mt-6 flex max-h-40 flex-col">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Sources
                </div>
                <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex flex-col gap-3">
                    {Array.isArray(sources)
                      ? // Handle Array of strings
                        (showAllSources ? sources : sources.slice(0, 1)).map(
                          (source, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
                            >
                              {typeof source === "object"
                                ? JSON.stringify(source)
                                : String(source)}
                            </div>
                          ),
                        )
                      : // Handle Sefaria Object { "Ref": "Hebrew Text" }
                        (showAllSources
                          ? Object.entries(sources)
                          : Object.entries(sources).slice(0, 1)
                        ).map(([ref, text], index) => (
                          <a
                            key={index}
                            href={toSefariaUrl(ref)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="block rounded-lg border border-zinc-200 bg-white p-3 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition cursor-pointer"
                          >
                            <div
                              className="text-[10px] font-bold text-primary uppercase mb-1"
                              dir="ltr"
                            >
                              {String(ref)}
                            </div>
                            <div
                              className="text-base text-zinc-800 leading-relaxed font-serif"
                              dir="rtl"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(text)) }}
                            />
                          </a>
                        ))}
                    {(Array.isArray(sources)
                      ? sources.length
                      : Object.keys(sources).length) > 1 && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllSources((prev) => !prev);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            setShowAllSources((prev) => !prev);
                          }
                        }}
                        className="text-xs font-medium text-primary hover:underline self-center cursor-pointer"
                      >
                        {showAllSources
                          ? "Show less"
                          : `View ${(Array.isArray(sources) ? sources.length : Object.keys(sources).length) - 1} more source${(Array.isArray(sources) ? sources.length : Object.keys(sources).length) - 1 === 1 ? "" : "s"}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
