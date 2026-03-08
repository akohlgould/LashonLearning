import React, { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Flashcard from "../components/Flashcard";
import { exportToAnki } from "../../../../scripts/AnkiExport";

export default function FlashcardsPage({
  flashcards,
  loading,
  emptyReason,
  syncFromExtension,
  generateFromWords,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [frontMode, setFrontMode] = useState("word");
  const [cardKey, setCardKey] = useState(0);
  const [customWords, setCustomWords] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const handleRefresh = async () => {
    setCurrentIndex(0);
    if (useCustom && customWords.trim()) {
      const wordList = customWords
        .split(/[\n,]+/)
        .map((w) => w.trim())
        .filter(Boolean);
      await generateFromWords(wordList);
    } else {
      await syncFromExtension();
    }
  };

  const totalCards = flashcards.length;
  const safeIndex = totalCards > 0 ? Math.min(currentIndex, totalCards - 1) : 0;
  const currentCard = flashcards[safeIndex];

  const goNext = useCallback(() => {
    if (totalCards === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalCards);
    setCardKey((prev) => prev + 1);
  }, [totalCards]);

  const goBack = useCallback(() => {
    if (totalCards === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
    setCardKey((prev) => prev + 1);
  }, [totalCards]);

  const resetCard = () => setCardKey((prev) => prev + 1);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goBack();
      if (e.key.toLowerCase() === "r") resetCard();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goBack]);

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
      {/* Settings Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
          >
            Refresh Flashcards
          </button>

          <label className="inline-flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="accent-primary"
            />
            Use typed words
          </label>

          <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
            <button
              onClick={() => {
                setFrontMode("word");
                resetCard();
              }}
              className={`rounded-lg px-3 py-2 text-sm transition ${frontMode === "word" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600"}`}
            >
              Word first
            </button>
            <button
              onClick={() => {
                setFrontMode("definition");
                resetCard();
              }}
              className={`rounded-lg px-3 py-2 text-sm transition ${frontMode === "definition" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600"}`}
            >
              Definition first
            </button>
          </div>

          <button
            onClick={() => exportToAnki({ cards: flashcards })}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <Download size={16} />
            Export Anki
          </button>
        </div>

        {useCustom && (
          <textarea
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value)}
            placeholder="Enter words separated by commas or newlines, e.g.&#10;אמר&#10;דבר&#10;עשה"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            dir="rtl"
          />
        )}
      </div>

      {/* Main Flashcard Display Area */}
      <div className="flex flex-1 items-center justify-center gap-3 sm:gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-zinc-600 font-medium">
              Loading Hebrew Flashcards...
            </p>
          </div>
        ) : currentCard ? (
          <>
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
              aria-label="Previous flashcard"
            >
              <ChevronLeft size={24} />
            </button>

            <Flashcard
              key={`${safeIndex}-${cardKey}`}
              word={currentCard.word}
              definition={currentCard.definition}
              sources={currentCard.verses}
              frontMode={frontMode}
              className="w-full"
            />

            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
              aria-label="Next flashcard"
            >
              <ChevronRight size={24} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <p className="text-zinc-500">
              {emptyReason === "no-words"
                ? "No words found. Add words using the Sefaria Vocab Scraper extension, then press Refresh Flashcards."
                : "Extension couldn't load. Type in words above and press Refresh Flashcards to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Dot Indicators */}
      {flashcards.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {flashcards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                resetCard();
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === safeIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
