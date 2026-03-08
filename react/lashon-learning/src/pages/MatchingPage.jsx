import React, { useState, useCallback, useEffect, useRef } from "react";
import { getData } from "../services/sefariaApi";
import { shuffleArray, formatTime } from "../utils/helpers";

export default function MatchingPage({ words, loading, emptyReason }) {
  const [cards, setCards] = useState([]); // loaded {word, definition} pairs
  const [tiles, setTiles] = useState([]); // shuffled tiles for the board
  const [selected, setSelected] = useState(null); // currently selected tile index
  const [matched, setMatched] = useState(new Set()); // matched pair IDs
  const [wrong, setWrong] = useState(new Set()); // briefly flash wrong tiles
  const [gameState, setGameState] = useState("loading"); // loading | ready | playing | done
  const [timer, setTimer] = useState(0);
  const [penaltyFlash, setPenaltyFlash] = useState(false);
  const penaltyRef = useRef(0);
  const [bestTime, setBestTime] = useState(() => {
    const stored = localStorage.getItem("lashonLearning_matchBestTime");
    return stored ? parseFloat(stored) : null;
  });
  const timerRef = useRef(null);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Pick up to 6 random words and load their data
  const loadGame = useCallback(async () => {
    if (words.length === 0) return;
    setCardsLoading(true);
    setGameState("loading");
    setMatched(new Set());
    setSelected(null);
    setWrong(new Set());
    setTimer(0);
    penaltyRef.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    const count = Math.min(6, words.length);
    const picked = shuffleArray(words).slice(0, count);

    const results = await Promise.allSettled(picked.map((w) => getData(w)));
    const loaded = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value?.definition) {
        loaded.push({
          id: i,
          word: r.value.word || picked[i],
          definition: r.value.definition,
        });
      }
    });

    if (loaded.length < 2) {
      setCards([]);
      setTiles([]);
      setGameState("ready");
      setCardsLoading(false);
      return;
    }

    setCards(loaded);

    // Create tiles: one for each word, one for each definition
    const wordTiles = loaded.map((c) => ({
      pairId: c.id,
      type: "word",
      text: c.word,
    }));
    const defTiles = loaded.map((c) => ({
      pairId: c.id,
      type: "definition",
      text: c.definition,
    }));
    setTiles(shuffleArray([...wordTiles, ...defTiles]));
    setGameState("ready");
    setCardsLoading(false);
  }, [words]);

  useEffect(() => {
    if (!loading && words.length > 0) {
      loadGame();
    }
  }, [words, loading, loadGame]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const start = Date.now();
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer((Date.now() - start) / 1000 + penaltyRef.current);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTileClick = useCallback(
    (tileIndex) => {
      if (gameState === "done") return;
      const tile = tiles[tileIndex];
      if (
        matched.has(tile.pairId) &&
        matched.has(tile.pairId + "-" + tile.type)
      )
        return;
      // Check if this specific tile is already matched
      if (matched.has(`${tile.pairId}-${tile.type}`)) return;

      // Start timer on first click
      if (gameState === "ready") {
        setGameState("playing");
        startTimer();
      }

      if (selected === null) {
        setSelected(tileIndex);
        return;
      }

      if (selected === tileIndex) {
        setSelected(null);
        return;
      }

      const first = tiles[selected];

      // Must select different types (word + definition)
      if (first.type === tile.type) {
        setSelected(tileIndex);
        return;
      }

      // Check match
      if (first.pairId === tile.pairId) {
        const newMatched = new Set(matched);
        newMatched.add(`${first.pairId}-${first.type}`);
        newMatched.add(`${tile.pairId}-${tile.type}`);
        setMatched(newMatched);
        setSelected(null);

        // Check if game is complete
        if (newMatched.size === tiles.length) {
          setGameState("done");
          stopTimer();
          // Save best time
          setTimer((prev) => {
            const finalTime = prev;
            if (!bestTime || finalTime < bestTime) {
              setBestTime(finalTime);
              localStorage.setItem(
                "lashonLearning_matchBestTime",
                finalTime.toString(),
              );
            }
            return prev;
          });
        }
      } else {
        // Wrong match - flash red and add 1 second penalty
        penaltyRef.current += 1;
        setWrong(new Set([selected, tileIndex]));
        setSelected(null);
        setPenaltyFlash(true);
        setTimeout(() => setWrong(new Set()), 400);
        setTimeout(() => setPenaltyFlash(false), 800);
      }
    },
    [gameState, tiles, selected, matched, startTimer, stopTimer, bestTime],
  );

  const isLoading = loading || cardsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col items-center justify-center px-4 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-3 text-zinc-600 font-medium">
          Loading matching game...
        </p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col items-center justify-center px-4 py-8">
        <p className="text-zinc-500">
          {emptyReason === "no-words"
            ? "No words found. Add words using the extension or Word List page first."
            : "Extension couldn't load. Add words in the Word List page to get started."}
        </p>
      </div>
    );
  }

  if (cards.length < 2 && gameState !== "loading") {
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col items-center justify-center px-4 py-8">
        <p className="text-zinc-500">
          Need at least 2 words with definitions to play. Try adding more words.
        </p>
        <button
          onClick={loadGame}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <button
          onClick={loadGame}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
        >
          New Game
        </button>

        <div className="flex items-center gap-3 text-sm text-zinc-600">
          <span className="relative font-mono text-lg font-bold text-zinc-800">
            {formatTime(timer)}
            {penaltyFlash && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500 animate-[fadeUp_0.8s_ease-out_forwards]">
                +1s
              </span>
            )}
          </span>
          {bestTime && (
            <span className="text-xs text-zinc-400">
              Best: {formatTime(bestTime)}
            </span>
          )}
        </div>

        <div className="ml-auto text-sm text-zinc-500">
          {matched.size / 2} / {cards.length} matched
        </div>
      </div>

      {/* Game complete message */}
      {gameState === "done" && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-2xl font-bold text-green-700">Complete!</p>
          <p className="text-green-600">
            You matched all {cards.length} pairs in{" "}
            <span className="font-bold">{formatTime(timer)}</span>
          </p>
          {bestTime && timer <= bestTime && (
            <p className="text-sm font-medium text-green-500">New best time!</p>
          )}
          <button
            onClick={loadGame}
            className="mt-3 rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Tile grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {tiles.map((tile, i) => {
          const isMatched = matched.has(`${tile.pairId}-${tile.type}`);
          const isSelected = selected === i;
          const isWrong = wrong.has(i);

          return (
            <button
              key={`${tile.pairId}-${tile.type}-${i}`}
              onClick={() => handleTileClick(i)}
              disabled={isMatched}
              className={`
                relative flex min-h-[5rem] items-center justify-center rounded-2xl border-2 p-4 text-center transition-all duration-200
                ${
                  isMatched
                    ? "border-green-300 bg-green-50 opacity-50 scale-95"
                    : isWrong
                      ? "border-red-400 bg-red-50 animate-[shake_0.3s_ease-in-out]"
                      : isSelected
                        ? "border-primary bg-primary/5 shadow-md scale-[1.03]"
                        : "border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow-md"
                }
              `}
            >
              <span
                className={`text-sm font-medium leading-snug ${
                  tile.type === "word" ? "text-lg font-bold" : ""
                } ${isMatched ? "text-green-700" : "text-zinc-800"}`}
                dir={tile.type === "word" ? "rtl" : "ltr"}
              >
                {tile.text}
              </span>
              {/* Type indicator */}
              <span
                className={`absolute top-1.5 right-2 text-[10px] font-medium uppercase tracking-wide ${
                  isMatched ? "text-green-400" : "text-zinc-300"
                }`}
              >
                {tile.type === "word" ? "עב" : "EN"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
