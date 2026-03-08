import { getData } from "./getdata.js";

// internal helper: choose a random element
function randomInArray(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

// create TSV string from the shape returned by getData
async function convertToTSV(data) {
  const cards = data.cards;
  let tsv = "";
  for (const card of cards) {
    const verses = Object.values(card.verses ?? {});
    let randomVerse = verses.length > 0 ? randomInArray(verses) : "";
    randomVerse = randomVerse.replace(/[\t\n\r\f\v]/g, " ");
    const back = `${card.definition}<br/>${randomVerse}`;
    tsv = tsv.concat(`${card.word}\t${back}\n`);
  }
  return tsv;
}

export async function exportToAnki(data) {
  console.log(data);
  const tsv = await convertToTSV(data);
  const blob = new Blob([tsv], { type: "text/tab-separated-values" });
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards.tsv";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Anki export failed:", err);
    alert("Export failed. Make sure flashcards are fully loaded before exporting.");
  }
}

function randomInArray(array) {
  const index = Math.floor(Math.random() * (array.length - 1));
  return array[index];
}
