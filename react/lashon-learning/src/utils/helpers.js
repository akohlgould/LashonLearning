// Fisher-Yates shuffle — returns a new shuffled copy
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Encode a word list to a shareable base64 string
export function encodeWordList(wordList) {
  return btoa(encodeURIComponent(JSON.stringify(wordList)));
}

// Decode a base64 encoded word list
export function decodeWordList(encoded) {
  return JSON.parse(decodeURIComponent(atob(encoded)));
}

// Format seconds as "X.Xs" for game timer display
export function formatTime(t) {
  const s = Math.floor(t);
  const ms = Math.floor((t % 1) * 10);
  return `${s}.${ms}s`;
}
