import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import FlashcardsPage from './pages/FlashcardsPage'
import WordlistPage from './pages/wordlistPage'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

const EXTENSION_ID = "nlcebalffaibfcnohbknmgpkdoedliej";

function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyReason, setEmptyReason] = useState("");

  const syncFromExtension = useCallback(async () => {
    setLoading(true);

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { action: "getFlashcards" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Sync failed:", chrome.runtime.lastError.message);
            setWords([]);
            setEmptyReason("extension-error");
          } else if (response?.success) {
            const wordStrings = response.data.map((item) =>
              typeof item === "object" ? item.word : item,
            );
            setWords(wordStrings);
            setEmptyReason(wordStrings.length === 0 ? "no-words" : "");
          } else {
            setWords([]);
            setEmptyReason("extension-error");
          }
          setLoading(false);
        },
      );
    } else {
      const stored = localStorage.getItem('wordList');
      if (stored) {
        try {
          const wordList = JSON.parse(stored);
          setWords(wordList);
          setEmptyReason(wordList.length === 0 ? "no-words" : "");
        } catch {
          localStorage.removeItem('wordList');
          setWords([]);
          setEmptyReason("no-words");
        }
      } else {
        setWords([]);
        setEmptyReason("no-words");
      }
      setLoading(false);
    }
  }, []);

  const updateWords = useCallback((wordList) => {
    setWords(wordList);
    setEmptyReason(wordList.length === 0 ? "no-words" : "");
  }, []);

  // Fetch on app mount
  useEffect(() => {
    syncFromExtension();
  }, [syncFromExtension]);

  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <FlashcardsPage
              words={words}
              loading={loading}
              emptyReason={emptyReason}
              syncFromExtension={syncFromExtension}
            />
          }
        />
        <Route
          path="/wordlist"
          element={
            <WordlistPage
              words={words}
              loading={loading}
              syncFromExtension={syncFromExtension}
              updateWords={updateWords}
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
