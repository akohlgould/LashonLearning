import { getData } from "./sefariaApi";

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

// generate card data for an array of words via getData (parallelized)
export async function generateCardData(words) {
  if (!Array.isArray(words)) {
    throw new Error("generateCardData expects an array of words");
  }
  const cards = await Promise.all(words.map((w) => getData(w)));
  return { cards };
}

/**
 * Main export function. Accepts either:
 *   - an object with a `cards` array (existing data), or
 *   - an array of words (in which case definitions/verses are fetched).
 */
export async function exportToAnki(wordsOrData) {
  try {
    let data;
    if (Array.isArray(wordsOrData)) {
      data = await generateCardData(wordsOrData);
    } else if (wordsOrData && Array.isArray(wordsOrData.cards)) {
      data = wordsOrData;
    } else {
      throw new Error("exportToAnki requires an array of words or a data object");
    }

    const tsv = await convertToTSV(data);
    const blob = new Blob([tsv], { type: "text/tab-separated-values" });

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
