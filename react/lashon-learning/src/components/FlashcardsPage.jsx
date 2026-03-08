import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import Flashcard from "./Flashcard";
import { exportToAnki } from "../../../../AnkiExport";
import { generateCards } from "../../../../generateCards";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [frontMode, setFrontMode] = useState("word"); // "word" | "definition"
  const [cardKey, setCardKey] = useState(0);

  useEffect(() => {
    generateCards().then((cards) => {
      setFlashcards(cards);
      setLoading(false);
    });
  }, []);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  // const progressPercent = ((currentIndex + 1) / totalCards) * 100;

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCards);
    setCardKey((prev) => prev + 1);
  };

  const goBack = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
    setCardKey((prev) => prev + 1);
  };

  const resetCard = () => {
    setCardKey((prev) => prev + 1);
  };

  const exportFlashcards = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings: {
        frontMode,
      },
      flashcards,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goBack();
      if (e.key.toLowerCase() === "r") resetCard();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalCards]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
      {/* <div className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Flashcards
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Study one card at a time. Use the arrows or your keyboard.
            </p>
          </div>

          <div className="hidden text-sm text-zinc-500 sm:block">
            Left/Right arrows to navigate
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-zinc-600">
          <span>
            Card {currentIndex + 1} of {totalCards}
          </span>
          <span>{Math.round(progressPercent)}% complete</span>
        </div>
      </div> */}

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-700">Start with</span>

          <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
            <button
              type="button"
              onClick={() => {
                setFrontMode("word");
                resetCard();
              }}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                frontMode === "word"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Word first
            </button>

            <button
              type="button"
              onClick={() => {
                setFrontMode("definition");
                resetCard();
              }}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                frontMode === "definition"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Definition first
            </button>
          </div>
          
          <button
            type="button"
            onClick={resetCard}
            className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
          >
            <RotateCcw size={16} />
            Reset card
          </button>
        </div>
        <div className="flex gap-2">
          <button
          type="button"
          onClick={exportFlashcards}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <Download size={16} />
          Export
        </button>

        <button
          type="button"
          onClick={() => exportToAnki({cards: flashcards})}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <Download size={16} />
          Export for Anki
        </button>
      </div>
        
      </div>

      <div className="flex flex-1 items-center justify-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            aria-label="Previous flashcard"
          >
            <ChevronLeft size={22} />
          </button>

            <Flashcard
              key={cardKey}
              word={currentCard.word}
              definition={currentCard.definition}
              sources={currentCard.verses}
              frontMode={frontMode}
              className="w-full"
            />

          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            aria-label="Next flashcard"
          >
            <ChevronRight size={22} />
          </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {flashcards.map((_, index) => {
          const isActive = index === currentIndex;

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                setCurrentIndex(index);
                setCardKey((prev) => prev + 1);
              }}
              className={`h-2.5 rounded-full transition-all ${
                isActive ? "w-8 bg-zinc-900" : "w-2.5 bg-zinc-300 hover:bg-zinc-400"
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}