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

  const EXTENSION_ID = "clfjfbninbofghknomnofoilaejkobnd";

  const syncFlashcards = useCallback(async () => {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: "getFlashcards" },
          async (response) => {
            if (chrome.runtime.lastError) {
              console.error("Sync failed:", chrome.runtime.lastError.message);
              setFlashcards([]);
            } else if (response?.success) {
              // Pass the extension data to your card generator
              const cards = await generateCards(response.data);
              setFlashcards(cards);
            }
            setLoading(false);
          }
      );
    } else {
      const cards = await generateCards(['אמר', 'דבר', 'עשה']); // Fallback to hardcoded words
      setFlashcards(cards);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncFlashcards();
  }, [syncFlashcards]);

  const totalCards = flashcards.length;
  const currentCard = flashcards[currentIndex];

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % totalCards);
  const goBack = () => setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  const resetCard = () => setCardKey((prev) => prev + 1);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!currentCard) return <div className="flex h-screen items-center justify-center">No cards found.</div>;

  return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-4 py-8">

        {/* Settings Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
              <button
                  onClick={() => setFrontMode("word")}
                  className={`rounded-lg px-3 py-2 text-sm ${frontMode === "word" ? "bg-white shadow-sm" : "text-zinc-600"}`}
              >
                Word first
              </button>
              <button
                  onClick={() => setFrontMode("definition")}
                  className={`rounded-lg px-3 py-2 text-sm ${frontMode === "definition" ? "bg-white shadow-sm" : "text-zinc-600"}`}
              >
                Definition first
              </button>
            </div>

            {/* Using RotateCcw here to clear the warning */}
            <button
                onClick={resetCard}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <RotateCcw size={16} />
              Reset Card
            </button>

            <button
                onClick={syncFlashcards}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
            >
              Sync from Extension
            </button>
          </div>

          <button
              onClick={() => exportToAnki({ cards: flashcards })}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm"
          >
            <Download size={16} /> Export Anki
          </button>
        </div>

        {/* Flashcard Area */}
        <div className="flex flex-1 items-center justify-center gap-3">
          <button onClick={goBack} className="h-12 w-12 rounded-full border border-zinc-200 bg-white flex items-center justify-center shadow-sm hover:bg-zinc-50">
            <ChevronLeft size={22} />
          </button>

          <Flashcard
              key={`${currentIndex}-${cardKey}`}
              word={currentCard.word}
              definition={currentCard.definition}
              sources={currentCard.verses}
              frontMode={frontMode}
          />

          <button onClick={goNext} className="h-12 w-12 rounded-full border border-zinc-200 bg-white flex items-center justify-center shadow-sm hover:bg-zinc-50">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
  );
}