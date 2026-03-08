import React, { useState } from "react";
import { Trash2, RefreshCw, Plus } from "lucide-react";

export default function WordlistPage({
  words,
  loading,
  syncFromExtension,
  updateWords,
}) {
  const [newWord, setNewWord] = useState("");

  const EXTENSION_ID = "nlcebalffaibfcnohbknmgpkdoedliej";

  const removeWord = async (wordToRemove) => {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { action: "removeWord", word: wordToRemove },
        async (response) => {
          let updatedWords;
          if (response && response.success) {
            updatedWords = response.data.map((item) => item.word);
          } else {
            updatedWords = words.filter((w) => w !== wordToRemove);
          }
          localStorage.setItem("wordList", JSON.stringify(updatedWords));
          updateWords(updatedWords);
        },
      );
    } else {
      const updatedWords = words.filter((w) => w !== wordToRemove);
      localStorage.setItem("wordList", JSON.stringify(updatedWords));
      updateWords(updatedWords);
    }
  };

  const addWord = async () => {
    if (newWord.trim()) {
      if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: "addWord", word: newWord.trim() },
          async (response) => {
            let updatedWords;
            if (response && response.success) {
              updatedWords = response.data.map((item) => item.word);
              setNewWord("");
            } else {
              updatedWords = [...words, newWord.trim()];
              setNewWord("");
            }
            localStorage.setItem("wordList", JSON.stringify(updatedWords));
            updateWords(updatedWords);
          },
        );
      } else {
        if (words.includes(newWord.trim())) return;
        const updatedWords = [...words, newWord.trim()];
        localStorage.setItem("wordList", JSON.stringify(updatedWords));
        setNewWord("");
        updateWords(updatedWords);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Your Words</h1>
        <p className="text-zinc-600">
          {words.length} word{words.length !== 1 ? "s" : ""} to study
        </p>
      </div>

      {/* Add Word Section */}
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addWord();
            }}
            placeholder="Add a new word..."
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            dir="auto"
          />
          <button
            onClick={addWord}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 active:scale-95"
          >
            <Plus size={16} />
            Add
          </button>
          <button
            onClick={syncFromExtension}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Word List */}
      <div className="flex-1 rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-zinc-600 font-medium">Loading words...</p>
          </div>
        ) : words.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <p className="text-zinc-500">
              No words yet. Add one above to get started!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {words.map((word, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 p-4 transition hover:bg-zinc-50"
              >
                <button
                  onClick={() => removeWord(word)}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 active:scale-95"
                  aria-label={`Remove ${word}`}
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-lg font-medium text-zinc-900 break-words"
                    dir="rtl"
                  >
                    {word}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
