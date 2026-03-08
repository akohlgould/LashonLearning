import React, { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Flashcard from "../components/Flashcard";
import { exportToAnki } from "../../../../scripts/AnkiExport";
import { getData } from "../../../../scripts/getdata";

export default function FlashcardsPage({
  words,
  loading,
  emptyReason,
  syncFromExtension,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [frontMode, setFrontMode] = useState("word");
  const [cardKey, setCardKey] = useState(0);
  const [flashcards, setFlashcards] = useState({});
  const loadedRef = useRef(new Set());

  const loadCards = useCallback(async (...indices) => {
    const toLoad = indices.filter(
      (i) => i >= 0 && i < words.length && !loadedRef.current.has(i),
    );
    if (toLoad.length === 0) return;
    toLoad.forEach((i) => loadedRef.current.add(i));
    const results = await Promise.all(
      toLoad.map((i) => getData(words[i]).then((card) => [i, card])),
    );
    setFlashcards((prev) => {
      const next = { ...prev };
      results.forEach(([i, card]) => {
        next[i] = card;
      });
      return next;
    });
  }, [words]);

  // Reset and load initial cards when words change
  useEffect(() => {
    setFlashcards({});
    loadedRef.current = new Set();
    setCurrentIndex(0);
    setCardKey((prev) => prev + 1);
    if (words.length > 0) {
      loadCards(0, 1);
    }
  }, [words, loadCards]);

  const handleRefresh = async () => {
    setCurrentIndex(0);
    await syncFromExtension();
  };

  const totalCards = words.length;
  const safeIndex = totalCards > 0 ? Math.min(currentIndex, totalCards - 1) : 0;
  const currentCard = flashcards[safeIndex];
  const cardLoading = loading || (totalCards > 0 && !currentCard);

  const navigateTo = useCallback(
    (index) => {
      setCurrentIndex(index);
      setCardKey((prev) => prev + 1);
      if (totalCards > 0) {
        const nextIndex = (index + 1) % totalCards;
        loadCards(index, nextIndex);
      }
    },
    [totalCards, loadCards],
  );

  const goNext = useCallback(() => {
    if (totalCards === 0) return;
    navigateTo((currentIndex + 1) % totalCards);
  }, [totalCards, currentIndex, navigateTo]);

  const goBack = useCallback(() => {
    if (totalCards === 0) return;
    navigateTo((currentIndex - 1 + totalCards) % totalCards);
  }, [totalCards, currentIndex, navigateTo]);

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

  const loadedCards = Object.values(flashcards);

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
            onClick={() => exportToAnki({ cards: loadedCards })}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <Download size={16} />
            Export Anki
          </button>
        </div>
      </div>

      {/* Main Flashcard Display Area */}
      <div className="flex flex-1 items-center justify-center gap-3 sm:gap-6">
        {cardLoading ? (
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
                : "Extension couldn't load. Type in words in the word list page and press Refresh Flashcards to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Dot Indicators */}
      {totalCards > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {words.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateTo(index)}
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
