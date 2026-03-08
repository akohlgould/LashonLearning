import { getData } from "./getdata.js";

async function convertToTSV(data) {
  const cards = data.cards;
  let tsv = "";
  for (const card of cards) {
    const randomVerse = randomInArray(card.verses);
    const back = `${card.definition};${randomVerse}`;
    tsv = tsv.concat(`${card.word}\t${back}\n`);
  }
  return tsv;
}

export async function exportToAnki(data) {
  const tsv = await convertToTSV(data);
  const blob = new Blob([tsv], { type: "text/tab-separated-values" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards.tsv";
  a.click();
  URL.revokeObjectURL(url);
}

function randomInArray(array) {
  return array[Math.floor(Math.random() * (array.length - 1))];
}

async function main() {
  const entry = await getData("תורה");
  const data = { cards: [entry] };
  console.log(convertToTSV(data));
}
