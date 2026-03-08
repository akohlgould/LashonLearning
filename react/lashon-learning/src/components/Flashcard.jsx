import React, { useMemo, useState } from "react";

export default function Flashcard({
                                    word,
                                    definition,
                                    sources = [],
                                    className = "",
                                    frontMode = "word",
                                  }) {
  const [showBack, setShowBack] = useState(false);

  // 1. Safely check if sources exist (handles Array or Object)
  const hasSources = useMemo(() => {
    if (!sources) return false;
    if (Array.isArray(sources)) return sources.length > 0;
    if (typeof sources === 'object') return Object.keys(sources).length > 0;
    return false;
  }, [sources]);

  const isWordFirst = frontMode === "word";
  const frontLabel = isWordFirst ? "Word" : "Definition";
  const backLabel = isWordFirst ? "Definition" : "Word";

  // Use String() to ensure we never pass an object directly to React children
  const frontContent = isWordFirst ? String(word || "") : String(definition || "");
  const backContent = isWordFirst ? String(definition || "") : String(word || "");

  return (
      <div className={`w-full max-w-2xl ${className}`}>
        <button
            type="button"
            onClick={() => setShowBack((prev) => !prev)}
            className="group relative h-[28rem] w-full rounded-3xl text-left outline-none transition-transform duration-150 hover:scale-[1.01] cursor-pointer"
        >
          {/* Card background styling */}
          <div className="absolute inset-0 rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/5" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-zinc-50 to-zinc-100" />

          {/* --- FRONT SIDE --- */}
          <div
              className={`absolute inset-0 flex flex-col justify-between rounded-3xl p-8 transition-opacity duration-300 ${
                  showBack ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
          >
            <div className="flex items-center justify-between">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary">
              {frontLabel}
            </span>
              <span className="text-xs text-zinc-400">Click to reveal</span>
            </div>

            <div className="flex flex-1 items-center justify-center px-4">
              <h2
                  className={`text-center font-bold text-zinc-900 ${isWordFirst ? "text-5xl" : "text-2xl"}`}
                  dir={isWordFirst ? "rtl" : "ltr"}
              >
                {frontContent}
              </h2>
            </div>

            <div className="text-center text-xs text-zinc-400 uppercase tracking-widest">
              Flashcard
            </div>
          </div>

          {/* --- BACK SIDE --- */}
          <div
              className={`absolute inset-0 flex flex-col rounded-3xl p-8 transition-opacity duration-300 ${
                  showBack ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
          >
            <div className="flex items-center justify-between">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium tracking-wide text-sky-700">
              {backLabel}
            </span>
              <span className="text-xs text-zinc-400">Click to go back</span>
            </div>

            <div className="mt-4 flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-center py-4">
                <h2
                    className={`text-center font-semibold text-zinc-900 ${!isWordFirst ? "text-5xl" : "text-2xl"}`}
                    dir={!isWordFirst ? "rtl" : "ltr"}
                >
                  {backContent}
                </h2>
              </div>

              {/* Sources Section */}
              {hasSources && (
                  <div className="mt-6 flex min-h-0 flex-1 flex-col">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Sources
                    </div>
                    <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <div className="flex flex-col gap-3">
                        {Array.isArray(sources) ? (
                            // Handle Array of strings
                            sources.map((source, index) => (
                                <div key={index} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
                                  {typeof source === 'object' ? JSON.stringify(source) : String(source)}
                                </div>
                            ))
                        ) : (
                            // Handle Sefaria Object { "Ref": "Hebrew Text" }
                            Object.entries(sources).map(([ref, text], index) => (
                                <div key={index} className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
                                  <div className="text-[10px] font-bold text-primary uppercase mb-1" dir="ltr">
                                    {String(ref)}
                                  </div>
                                  <div className="text-base text-zinc-800 leading-relaxed font-serif" dir="rtl"
                                       dangerouslySetInnerHTML={{ __html: String(text) }} />
                                </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </button>
      </div>
  );
}