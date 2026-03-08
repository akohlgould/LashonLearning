import React, { useMemo, useState } from "react";

export default function Flashcard({
  word,
  definition,
  sources = {},
  className = "",
  frontMode = "word",
}) {
  const [showBack, setShowBack] = useState(false);

  const hasSources = useMemo(() => Object.keys(sources).length > 0, [sources]);

  const isWordFirst = frontMode === "word";

  const frontLabel = isWordFirst ? "Word" : "Definition";
  const backLabel = isWordFirst ? "Definition" : "Word";

  const frontContent = isWordFirst ? word : definition;
  const backContent = isWordFirst ? definition : word;

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <button
        type="button"
        onClick={() => setShowBack((prev) => !prev)}
        className="group relative h-[28rem] w-full rounded-3xl text-left outline-none transition-transform duration-150 hover:scale-[1.01] cursor-pointer"
      >
        {/* Card background */}
        <div className="absolute inset-0 rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/5" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-zinc-50 to-zinc-100" />

        {/* Front */}
        <div
          className={`absolute inset-0 flex flex-col justify-between rounded-3xl p-6 transition-opacity duration-300 ${
            showBack ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium tracking-wide text-emerald-700">
              {frontLabel}
            </span>

            <span className="text-xs text-zinc-500">Click to reveal</span>
          </div>

          <div className="flex flex-1 items-center justify-center px-4">
            <div className="max-w-xl text-center">
              <h2
                className={`font-semibold tracking-tight text-zinc-900 ${
                  isWordFirst
                    ? "text-4xl sm:text-5xl"
                    : "text-xl leading-8 sm:text-2xl sm:leading-9"
                }`}
              >
                {frontContent}
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>Flashcard</span>
            <span>{frontLabel}</span>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 flex flex-col rounded-3xl p-6 transition-opacity duration-300 ${
            showBack ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium tracking-wide text-sky-700">
              {backLabel}
            </span>

            <span className="text-xs text-zinc-500">Click to go back</span>
          </div>

          <div className="mt-4 flex-1 flex flex-col overflow-hidden">
            {isWordFirst ? (
              <p className="text-sm leading-7 text-zinc-700 sm:text-[15px]">
                {backContent}
              </p>
            ) : (
              <div className="flex h-full items-center justify-center">
                <h2 className="text-center text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                  {backContent}
                </h2>
              </div>
            )}

            {hasSources && (
              <div className="mt-6 flex min-h-0 flex-1 flex-col">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Sources
                </div>

                <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex flex-col gap-2">
                    {Object.entries(sources).map(([name, verse]) => (
                      <div
                        key={name}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600"
                      >
                        <div className="font-medium text-zinc-700">{name}</div>
                        <div className="mt-1" dangerouslySetInnerHTML={{ __html: verse }} />
                      </div>
                    ))}
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