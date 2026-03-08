import { getData } from "./getdata.js";

export async function generateCards(words) {
  let wordList = words;

  if (!Array.isArray(wordList) || wordList.length === 0) {
    wordList = [];
  }

  const cards = [];

  for (const word of wordList) {
    cards.push(await getData(word));
  }

  return cards;
}
