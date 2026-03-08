(() => {
  // Strip taamim (cantillation marks) from Hebrew text, keeping nekudot
  function cleanHebrew(text) {
    return text.replace(/[\u0591-\u05AF]/g, "").trim();
  }

  // ─── Inject styles ───
  const style = document.createElement("style");
  style.textContent = `
    #sefaria-vocab-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #18345D;
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 2147483640;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    #sefaria-vocab-fab:hover {
      transform: scale(1.1);
      background: #1a4a8a;
    }
    #sefaria-vocab-fab.drag-over {
      background: #2ecc71;
      transform: scale(1.2);
      box-shadow: 0 4px 20px rgba(46,204,113,0.5);
    }
    #sefaria-vocab-fab .fab-icon {
      pointer-events: none;
      line-height: 1;
    }
    #sefaria-vocab-fab .fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #e74c3c;
      color: #fff;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      font-family: sans-serif;
    }

    #sefaria-vocab-panel {
      position: fixed;
      bottom: 96px;
      right: 28px;
      width: 320px;
      max-height: 450px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      z-index: 2147483640;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Heebo', 'Roboto', sans-serif;
    }
    #sefaria-vocab-panel.open {
      display: flex;
    }
    #sefaria-vocab-panel-header {
      background: #18345D;
      color: #fff;
      padding: 14px 16px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #sefaria-vocab-panel-header .panel-count {
      font-size: 13px;
      opacity: 0.8;
      font-weight: 400;
    }
    #sefaria-vocab-panel-list {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      max-height: 360px;
      direction: rtl;
    }
    #sefaria-vocab-panel-list li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-bottom: 1px solid #eee;
      font-size: 18px;
      direction: rtl;
    }
    #sefaria-vocab-panel-list li:last-child {
      border-bottom: none;
    }
    #sefaria-vocab-panel-list .word-text {
      flex: 1;
      font-family: 'Heebo', serif;
    }
    #sefaria-vocab-panel-list .remove-btn {
      background: none;
      border: none;
      color: #e74c3c;
      cursor: pointer;
      font-size: 18px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 8px;
      direction: ltr;
      transition: background 0.15s;
    }
    #sefaria-vocab-panel-list .remove-btn:hover {
      background: #fdecea;
    }
    #sefaria-vocab-panel-empty {
      padding: 28px 16px;
      text-align: center;
      color: #999;
      font-size: 14px;
      direction: ltr;
    }

    #sefaria-vocab-drop-hint {
      position: fixed;
      bottom: 90px;
      right: 36px;
      background: rgba(0,0,0,0.8);
      color: #fff;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-family: sans-serif;
      z-index: 2147483641;
      display: none;
      pointer-events: none;
      white-space: nowrap;
    }

    #sefaria-vocab-tooltip {
      position: absolute;
      background: #18345D;
      color: #fff;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-family: sans-serif;
      z-index: 2147483641;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      user-select: none;
      display: none;
      transition: opacity 0.15s;
    }
    #sefaria-vocab-tooltip:hover {
      background: #1a4a8a;
    }
    #sefaria-vocab-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #18345D;
    }
  `;
  document.head.appendChild(style);

  // ─── Settings ───
  let fabEnabled = true;
  let tooltipEnabled = true;

  // ─── Create FAB ───
  const fab = document.createElement("button");
  fab.id = "sefaria-vocab-fab";
  fab.title = "Word List";
  fab.innerHTML = `<span class="fab-icon">📚</span><span class="fab-badge" style="display:none">0</span>`;
  document.body.appendChild(fab);

  const badge = fab.querySelector(".fab-badge");

  // ─── Create drop hint ───
  const dropHint = document.createElement("div");
  dropHint.id = "sefaria-vocab-drop-hint";
  dropHint.textContent = "Drop to add word";
  document.body.appendChild(dropHint);

  // ─── Create tooltip ───
  const tooltip = document.createElement("div");
  tooltip.id = "sefaria-vocab-tooltip";
  tooltip.textContent = "Add to word list";
  document.body.appendChild(tooltip);

  // ─── Create Panel ───
  const panel = document.createElement("div");
  panel.id = "sefaria-vocab-panel";
  panel.innerHTML = `
    <div id="sefaria-vocab-panel-header">
      <span>Word List</span>
      <span class="panel-count"></span>
    </div>
    <ul id="sefaria-vocab-panel-list"></ul>
    <div id="sefaria-vocab-panel-empty">Drag Hebrew words here to add them</div>
  `;
  document.body.appendChild(panel);

  const panelList = panel.querySelector("#sefaria-vocab-panel-list");
  const panelEmpty = panel.querySelector("#sefaria-vocab-panel-empty");
  const panelCount = panel.querySelector(".panel-count");

  // ─── State ───
  let panelOpen = false;

  function updateBadge(count) {
    if (count > 0) {
      badge.style.display = "flex";
      badge.textContent = count;
    } else {
      badge.style.display = "none";
    }
  }

  function renderPanel(wordList) {
    panelList.innerHTML = "";
    panelCount.textContent = wordList.length + " word" + (wordList.length !== 1 ? "s" : "");
    updateBadge(wordList.length);

    if (wordList.length === 0) {
      panelEmpty.style.display = "block";
      panelList.style.display = "none";
      return;
    }
    panelEmpty.style.display = "none";
    panelList.style.display = "block";

    wordList.forEach((item) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.className = "word-text";
      span.textContent = item.word;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "\u2715";
      removeBtn.title = "Remove";
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeWord(item.word);
      });

      li.appendChild(span);
      li.appendChild(removeBtn);
      panelList.appendChild(li);
    });
  }

  function loadWords() {
    chrome.storage.local.get({ wordList: [] }, (data) => {
      renderPanel(data.wordList);
    });
  }

  function addWord(word) {
    const cleaned = cleanHebrew(word);
    if (!cleaned) return;

    chrome.storage.local.get({ wordList: [] }, (data) => {
      if (data.wordList.some((item) => item.word === cleaned)) return;
      const updatedList = [
        ...data.wordList,
        { word: cleaned, date: new Date().toISOString() },
      ];
      chrome.storage.local.set({ wordList: updatedList }, () => {
        renderPanel(updatedList);
      });
    });
  }

  function removeWord(word) {
    chrome.storage.local.get({ wordList: [] }, (data) => {
      const updatedList = data.wordList.filter((item) => item.word !== word);
      chrome.storage.local.set({ wordList: updatedList }, () => {
        renderPanel(updatedList);
      });
    });
  }

  // ─── FAB click → toggle panel ───
  fab.addEventListener("click", () => {
    panelOpen = !panelOpen;
    panel.classList.toggle("open", panelOpen);
    if (panelOpen) loadWords();
  });

  // Close panel when clicking outside
  document.addEventListener("mousedown", (e) => {
    if (panelOpen && !panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
      panelOpen = false;
      panel.classList.remove("open");
    }
  });

  // ─── Drag-and-drop on FAB ───
  document.addEventListener("dragstart", () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      dropHint.style.display = "block";
    }
  });

  document.addEventListener("dragend", () => {
    dropHint.style.display = "none";
    fab.classList.remove("drag-over");
  });

  fab.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    fab.classList.add("drag-over");
  });

  fab.addEventListener("dragleave", () => {
    fab.classList.remove("drag-over");
  });

  fab.addEventListener("drop", (e) => {
    e.preventDefault();
    fab.classList.remove("drag-over");
    dropHint.style.display = "none";

    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      const words = text.trim().split(/\s+/);
      words.forEach((w) => addWord(w));

      if (!panelOpen) {
        panelOpen = true;
        panel.classList.add("open");
      }
      setTimeout(loadWords, 100);
    }
  });

  // Also support drop on the panel itself
  panel.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    fab.classList.add("drag-over");
  });

  panel.addEventListener("dragleave", () => {
    fab.classList.remove("drag-over");
  });

  panel.addEventListener("drop", (e) => {
    e.preventDefault();
    fab.classList.remove("drag-over");
    dropHint.style.display = "none";

    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      const words = text.trim().split(/\s+/);
      words.forEach((w) => addWord(w));
      setTimeout(loadWords, 100);
    }
  });

  // ─── Tooltip on text selection ───
  let tooltipWord = null;

  function getSelectedHebrewWord() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return null;
    const text = sel.toString().trim();
    if (!text) return null;
    // Check if selection is within Sefaria Hebrew text
    const anchor = sel.anchorNode;
    if (!anchor) return null;
    const parent = anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor;
    if (!parent || !parent.closest('.segment')) return null;
    // Take only the first word if multiple selected
    const words = text.split(/\s+/);
    return words[0];
  }

  function showTooltip() {
    if (!tooltipEnabled) return;
    const word = getSelectedHebrewWord();
    if (!word) { hideTooltip(); return; }
    const cleaned = cleanHebrew(word);
    if (!cleaned) { hideTooltip(); return; }

    tooltipWord = cleaned;
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    tooltip.style.display = "block";
    tooltip.style.left = (window.scrollX + rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + "px";
    tooltip.style.top = (window.scrollY + rect.top - tooltip.offsetHeight - 10) + "px";
  }

  function hideTooltip() {
    tooltip.style.display = "none";
    tooltipWord = null;
  }

  document.addEventListener("mouseup", (e) => {
    if (e.target === tooltip || tooltip.contains(e.target)) return;
    setTimeout(showTooltip, 10);
  });

  document.addEventListener("mousedown", (e) => {
    if (e.target === tooltip || tooltip.contains(e.target)) return;
    hideTooltip();
  });

  tooltip.addEventListener("click", () => {
    if (tooltipWord) {
      addWord(tooltipWord);
      hideTooltip();
      window.getSelection().removeAllRanges();
    }
  });

  // ─── Apply settings visibility ───
  function applySettings() {
    fab.style.display = fabEnabled ? "flex" : "none";
    if (!fabEnabled) {
      panel.classList.remove("open");
      panelOpen = false;
    }
  }

  // ─── Load settings and listen for changes ───
  chrome.storage.local.get({ fabEnabled: true, tooltipEnabled: true }, (data) => {
    fabEnabled = data.fabEnabled;
    tooltipEnabled = data.tooltipEnabled;
    applySettings();
  });

  // ─── Listen for storage changes from popup or background ───
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.wordList) {
      renderPanel(changes.wordList.newValue || []);
    }
    if (changes.fabEnabled) {
      fabEnabled = changes.fabEnabled.newValue;
      applySettings();
    }
    if (changes.tooltipEnabled) {
      tooltipEnabled = changes.tooltipEnabled.newValue;
      if (!tooltipEnabled) hideTooltip();
    }
  });

  // ─── Initial load ───
  loadWords();
})();