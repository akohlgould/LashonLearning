import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Flashcard from "../components/Flashcard";
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
  const [emptyReason, setEmptyReason] = useState("");

  const EXTENSION_ID = "nlcebalffaibfcnohbknmgpkdoedliej";

  const syncFlashcards = async () => {
    setLoading(true);

    // If custom words are provided, use those
    if (useCustom && customWords.trim()) {
      const wordList = customWords
        .split(/[\n,]+/)
        .map((w) => w.trim())
        .filter(Boolean);
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
            setEmptyReason("extension-error");
          } else if (response?.success) {
            // FIX: Extract just the word string from the extension objects
            const wordStrings = response.data.map((item) =>
              typeof item === "object" ? item.word : item,
            );

            if (wordStrings.length === 0) {
              setFlashcards([]);
              setEmptyReason("no-words");
            } else {
              // Pass the array of strings to generateCards
              const cards = await generateCards(wordStrings);
              setFlashcards(cards);
              setEmptyReason("");
            }
          } else {
            setFlashcards([]);
            setUseCustom(true);
            setEmptyReason("extension-error");
          }
          setLoading(false);
          setCurrentIndex(0);
          setCurrentIndex(0);
        },
      );
    } else {
      setFlashcards([]);
      setUseCustom(true);
      setEmptyReason("extension-error");
      setLoading(false);
    }
  };

  useEffect(() => {
    syncFlashcards();
  }, []);

  const totalCards = flashcards.length;
  const currentCard = flashcards[currentIndex];
  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

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
            onClick={syncFlashcards}
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
                index === currentIndex
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
