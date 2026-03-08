import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import Flashcard from "./Flashcard";
import { exportToAnki } from "../../../../scripts/AnkiExport";
import { generateCards } from "../../../../scripts/generateCards";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [frontMode, setFrontMode] = useState("word");
  const [cardKey, setCardKey] = useState(0);

  const EXTENSION_ID = "nlcebalffaibfcnohbknmgpkdoedliej";

  const syncFlashcards = useCallback(async () => {
    setLoading(true);
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: "getFlashcards" },
          async (response) => {
            if (chrome.runtime.lastError) {
              const cards = await generateCards();
              setFlashcards(cards);
            } else if (response?.success) {
              // FIX: Extract just the word string from the extension objects
              const wordStrings = response.data.map(item =>
                  typeof item === 'object' ? item.word : item
              );

              // Pass the array of strings to generateCards
              const cards = await generateCards(wordStrings);
              setFlashcards(cards);
            }
            setLoading(false);
            setCurrentIndex(0);
          }
      );
    }
  }, [generateCards]);

  useEffect(() => {
    syncFlashcards();
  }, [syncFlashcards]);

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
          <p className="text-zinc-600">No cards found in extension storage.</p>
          <button
              onClick={syncFlashcards}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
          >
            Try Sync Again
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
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
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
                onClick={resetCard}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
            >
              <RotateCcw size={16} />
              Reset Card
            </button>

            <button
                onClick={syncFlashcards}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
            >
              Sync Extension
            </button>
          </div>

          <div className="flex gap-2">
            <button
                onClick={() => exportToAnki({ cards: flashcards })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <Download size={16} />
              Export Anki
            </button>
          </div>
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