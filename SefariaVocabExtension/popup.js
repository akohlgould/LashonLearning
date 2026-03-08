document.addEventListener("DOMContentLoaded", () => {
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

      const wordItem = document.createElement("div");
      wordItem.className = "word-item";

      const wordSpan = document.createElement("span");
      wordSpan.textContent = word;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        chrome.storage.local.get({ wordList: [] }, (data) => {
          const updated = data.wordList.filter((w) => w.word !== word);
          chrome.storage.local.set({ wordList: updated }, () => {
            renderWords(updated);
          });
        });
      });

      wordItem.appendChild(wordSpan);
      wordItem.appendChild(removeBtn);
      li.appendChild(wordItem);
      wordList.appendChild(li);
    });
  }
  chrome.storage.local.get({ wordList: [] }, (data) => {
    renderWords(data.wordList);
  });
});
