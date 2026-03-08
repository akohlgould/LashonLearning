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
      // Check for duplicates
      if (data.wordList.some((item) => item.word === word)) return;

      const updatedList = [
        ...data.wordList,
        { word: word, date: new Date().toISOString() },
      ];
      chrome.storage.local.set({ wordList: updatedList });
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
    }
  },
);
