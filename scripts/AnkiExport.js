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
    let randomVerse = randomInArray(Object.values(card.verses || {}));
    if (typeof randomVerse === "string") {
      // strip any stray whitespace characters
      randomVerse = randomVerse.replace(/[\t\n\r\f\v]/g, " ");
    } else {
      randomVerse = "";
    }
    console.log(randomVerse);
    const back = `${card.definition || ""}<br/>${randomVerse}`;
    tsv = tsv.concat(`${card.word || ""}\t${back}\n`);
  }
  return tsv;
}

// generate card data for an array of words using getData()
export async function generateCardData(words) {
  if (!Array.isArray(words)) {
    throw new Error("generateCardData expects an array of words");
  }
  const cards = [];
  for (const w of words) {
    cards.push(await getData(w));
  }
  return { cards };
}

/**
 * Export flashcards to an Anki-compatible TSV file.
 *
 * Arguments:
 *   - wordsOrData: either an array of words, or an object with a `cards` array
 *
 * If you pass a list of words the function will fetch definitions/verses
 * itself via `getData`, allowing this module to be used independently of the
 * rest of the app.
 */
export async function exportToAnki(wordsOrData) {
  let data;
  if (Array.isArray(wordsOrData)) {
    data = await generateCardData(wordsOrData);
  } else if (wordsOrData && Array.isArray(wordsOrData.cards)) {
    data = wordsOrData;
  } else {
    throw new Error("exportToAnki requires an array of words or a data object");
  }

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

