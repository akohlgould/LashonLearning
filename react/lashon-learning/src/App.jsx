import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import FlashcardsPage from './pages/FlashcardsPage'
import WordlistPage from './pages/wordlistPage'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { generateCards } from '../../../scripts/generateCards'

const EXTENSION_ID = "nlcebalffaibfcnohbknmgpkdoedliej";

function App() {
  const [words, setWords] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyReason, setEmptyReason] = useState("");

  const syncFromExtension = useCallback(async () => {
    setLoading(true);

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { action: "getFlashcards" },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.error("Sync failed:", chrome.runtime.lastError.message);
            setWords([]);
            setFlashcards([]);
            setEmptyReason("extension-error");
          } else if (response?.success) {
            const wordStrings = response.data.map((item) =>
              typeof item === "object" ? item.word : item,
            );
            setWords(wordStrings);

            if (wordStrings.length === 0) {
              setFlashcards([]);
              setEmptyReason("no-words");
            } else {
              const cards = await generateCards(wordStrings);
              setFlashcards(cards);
              setEmptyReason("");
            }
          } else {
            setWords([]);
            setFlashcards([]);
            setEmptyReason("extension-error");
          }
          setLoading(false);
        },
      );
    } else {
      const stored = localStorage.getItem('wordList');
      if (stored) {
        const wordList = JSON.parse(stored);
        setWords(wordList);
        if (wordList.length > 0) {
          const cards = await generateCards(wordList);
          setFlashcards(cards);
          setEmptyReason("");
        } else {
          setFlashcards([]);
          setEmptyReason("no-words");
        }
      } else {
        setWords([]);
        setFlashcards([]);
        setEmptyReason("no-words");
      }
      setLoading(false);
    }
  }, []);

  const generateFromWords = useCallback(async (wordList) => {
    setLoading(true);
    setWords(wordList);
    if (wordList.length > 0) {
      const cards = await generateCards(wordList);
      setFlashcards(cards);
      setEmptyReason("");
    } else {
      setFlashcards([]);
    }
    setLoading(false);
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
              flashcards={flashcards}
              loading={loading}
              emptyReason={emptyReason}
              syncFromExtension={syncFromExtension}
              generateFromWords={generateFromWords}
            />
          }
        />
        <Route
          path="/wordlist"
          element={
            <WordlistPage
              words={words}
              flashcards={flashcards}
              loading={loading}
              syncFromExtension={syncFromExtension}
              generateFromWords={generateFromWords}
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
