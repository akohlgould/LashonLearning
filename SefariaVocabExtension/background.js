// Create the context menu option
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "addWord",
        title: "Add '%s' to Flashcard List",
        contexts: ["selection"]
    });
});

// Listen for the click
chrome.contextMenus.onClicked.addListener((info) => {
    // 'tab' was removed since it wasn't being used
    if (info.menuItemId === "addWord") {
        // ... rest of your code
        const word = info.selectionText.trim().toLowerCase();

        // Retrieve existing list, add new word, and save back
        chrome.storage.local.get({ wordList: [] }, (data) => {
            const updatedList = [...data.wordList, { word: word, date: new Date().toISOString() }];
            chrome.storage.local.set({ wordList: updatedList }, () => {
                console.log(`Saved: ${word}`);
            });
        });
    }
});
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.action === "getFlashcards") {
        chrome.storage.local.get({ wordList: [] }, (data) => {
            sendResponse({ success: true, data: data.wordList });
        });
        return true; // Keeps the channel open for the async response
    }
});