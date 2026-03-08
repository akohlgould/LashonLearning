document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("download");
  const clearBtn = document.getElementById("clear");
  const wordList = document.getElementById("word-list");
  const wordCount = document.getElementById("word-count");

  function renderWords(words) {
    wordList.innerHTML = "";

    if (words.length === 0) {
      wordCount.textContent = "No words saved yet.";
      const emptyItem = document.createElement("li");
      emptyItem.className = "empty-msg";
      emptyItem.textContent = "Right-click any word on Sefaria to add it!";
      wordList.appendChild(emptyItem);
      return;
    }

    wordCount.textContent = `${words.length} word${words.length === 1 ? "" : "s"} saved`;

    words.forEach(({ word }) => {
      const li = document.createElement("li");
      li.textContent = `${word}`;
      wordList.appendChild(li);
    });
  }
  chrome.storage.local.get({ wordList: [] }, (data) => {
    renderWords(data.wordList);
  });
});
