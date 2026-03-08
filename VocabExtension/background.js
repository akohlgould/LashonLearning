// Create the context menu option
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addWord",
    title: "Add '%s' to Flashcard List",
    contexts: ["selection"],
  });
});

// Strip taamim (cantillation marks) from Hebrew text, keeping nekudot
function cleanHebrew(text) {
  return text.replace(/[\u0591-\u05AF]/g, "");
}

// Listen for the click
// background.js
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "addWord") {
    // Trim whitespace but DON'T use toLowerCase() for Hebrew
    const word = cleanHebrew(info.selectionText.trim());

    chrome.storage.local.get({ wordList: [] }, (data) => {
      if (chrome.runtime.lastError) {
        console.error("Storage get error:", chrome.runtime.lastError.message);
        return;
      }
      // Check for duplicates
      if (data.wordList.some((item) => item.word === word)) return;

      const updatedList = [
        ...data.wordList,
        { word: word, date: new Date().toISOString() },
      ];
      chrome.storage.local.set({ wordList: updatedList }, () => {
        if (chrome.runtime.lastError) {
          console.error("Storage set error:", chrome.runtime.lastError.message);
        }
      });
    });
  }
});
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.action === "getFlashcards") {
      chrome.storage.local.get({ wordList: [] }, (data) => {
        sendResponse({ success: true, data: data.wordList });
      });
      return true; // Keeps the channel open for the async response
    } else if (request.action === "addWord") {
      const word = cleanHebrew(request.word.trim());
      chrome.storage.local.get({ wordList: [] }, (data) => {
        if (data.wordList.some((item) => item.word === word)) {
          sendResponse({ success: false, message: "Word already exists" });
          return;
        }
        const updatedList = [
          ...data.wordList,
          { word: word, date: new Date().toISOString() },
        ];
        chrome.storage.local.set({ wordList: updatedList }, () => {
          sendResponse({ success: true, data: updatedList });
        });
      });
      return true;
    } else if (request.action === "removeWord") {
      const word = cleanHebrew(request.word.trim());
      chrome.storage.local.get({ wordList: [] }, (data) => {
        const updatedList = data.wordList.filter((item) => item.word !== word);
        chrome.storage.local.set({ wordList: updatedList }, () => {
          sendResponse({ success: true, data: updatedList });
        });
      });
      return true;
    } else if (request.action === "importWords") {
      // Accepts { words: string[], mode: 'merge'|'replace' }
      const incoming = Array.isArray(request.words) ? request.words : [];
      const mode = request.mode === "replace" ? "replace" : "merge";
      // clean and dedupe words
      const cleaned = incoming
        .map((w) => cleanHebrew(w.trim()))
        .filter(Boolean);
      chrome.storage.local.get({ wordList: [] }, (data) => {
        let updatedList;
        if (mode === "replace") {
          updatedList = cleaned.map((w) => ({ word: w, date: new Date().toISOString() }));
        } else {
          const existingSet = new Set(data.wordList.map((item) => item.word));
          const toAdd = cleaned.filter((w) => !existingSet.has(w));
          updatedList = [
            ...data.wordList,
            ...toAdd.map((w) => ({ word: w, date: new Date().toISOString() })),
          ];
        }
        chrome.storage.local.set({ wordList: updatedList }, () => {
          sendResponse({ success: true, data: updatedList });
        });
      });
      return true;
    }
  },
);
