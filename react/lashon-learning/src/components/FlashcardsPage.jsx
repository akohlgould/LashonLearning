import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Flashcard from "./Flashcard";
import { exportToAnki } from "../../../../scripts/AnkiExport";
import { generateCards } from "../../../../scripts/generateCards";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [frontMode, setFrontMode] = useState("word");
  const [cardKey, setCardKey] = useState(0);
  const [customWords, setCustomWords] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const EXTENSION_ID = "nlcebalffaibfcnohbknmgpkdoedliej";

  const syncFlashcards = async () => {
    setLoading(true);

    // If custom words are provided, use those
    if (useCustom && customWords.trim()) {
      const wordList = customWords.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
      const cards = await generateCards(wordList);
      setFlashcards(cards);
      setLoading(false);
      setCurrentIndex(0);
      return;
    }

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: "getFlashcards" },
          async (response) => {
            if (chrome.runtime.lastError) {
              console.error("Sync failed:", chrome.runtime.lastError.message);
              setFlashcards([]);
              setUseCustom(true);
            } else if (response?.success) {
              // FIX: Extract just the word string from the extension objects
              const wordStrings = response.data.map(item =>
                  typeof item === 'object' ? item.word : item
              );

              // Pass the array of strings to generateCards
              const cards = await generateCards(wordStrings);
              setFlashcards(cards);
            } else {
              setFlashcards([]);
              setUseCustom(true);
            }
            setLoading(false);
            setCurrentIndex(0);
            setCurrentIndex(0);
          }
      );
    } else {
      setFlashcards([]);
      setUseCustom(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    syncFlashcards();
  }, []);

  const totalCards = flashcards.length;
  const currentCard = flashcards[currentIndex];
  const progressPercent = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

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

  if (loading) {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-zinc-600 font-medium">Loading Hebrew Flashcards...</p>
        </div>
    );
  }

  if (!currentCard) {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-50">
          <p className="text-zinc-600">Extension couldn't load. Please type in words to get started.</p>
          <textarea
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value)}
            placeholder="Enter words separated by commas or newlines, e.g.&#10;אמר&#10;דבר&#10;עשה"
            className="w-80 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={4}
            dir="rtl"
          />
          <button
              onClick={syncFlashcards}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
          >
            Load Flashcards
          </button>
        </div>
    );
  }

  return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-4 py-8 sm:px-6">

        {/* Progress Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-zinc-600">
            <span className="font-medium">Card {currentIndex + 1} of {totalCards}</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Settings Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <button
                onClick={syncFlashcards}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
            >
              Refresh Flashcards
            </button>

            <label className="inline-flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="accent-emerald-600"
              />
              Use typed words
            </label>

            <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
              <button
                  onClick={() => { setFrontMode("word"); resetCard(); }}
                  className={`rounded-lg px-3 py-2 text-sm transition ${frontMode === "word" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600"}`}
              >
                Word first
              </button>
              <button
                  onClick={() => { setFrontMode("definition"); resetCard(); }}
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              dir="rtl"
            />
          )}
        </div>

        {/* Main Flashcard Display Area */}
        <div className="flex flex-1 items-center justify-center gap-3 sm:gap-6">
          <button
              type="button"
              onClick={goBack}
              className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
              aria-label="Previous flashcard"
          >
            <ChevronLeft size={24} />
          </button>

          <Flashcard
              key={`${currentIndex}-${cardKey}`}
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
        </div>

        {/* Navigation Dot Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {flashcards.map((_, index) => (
              <button
                  key={index}
                  onClick={() => { setCurrentIndex(index); resetCard(); }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "w-8 bg-emerald-600" : "w-2 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                  aria-label={`Go to card ${index + 1}`}
              />
          ))}
        </div>
      </div>
  );
}