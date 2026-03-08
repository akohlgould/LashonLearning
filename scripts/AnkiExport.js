import { getData } from "./getdata.js";

async function convertToTSV(data) {
  const cards = data.cards;
  let tsv = "";
  for (const card of cards) {
    let randomVerse = randomInArray(Object.values(card.verses));
    randomVerse = randomVerse.replace("[\t\n\r\f\v]/g", " ");
    console.log(randomVerse);
    const back = `${card.definition}<br/>${randomVerse}`;
    tsv = tsv.concat(`${card.word}\t${back}\n`);
  }
  return tsv;
}

export async function exportToAnki(data) {
  console.log(data);
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
  const index = Math.floor(Math.random() * (array.length - 1));
  return array[index];
}
