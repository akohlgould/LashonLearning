import { getData } from "./getdata.js";

export async function exportToAnki(data) {
  const cards = data.cards;
  let tsv = "";
  for (const card of cards) {
    const randomVerse = randomInArray(card.verses);
    const back = `${card.definition};${randomVerse}`;
    tsv = tsv.concat(`${card.word}\t${back}\n`);
  }
  return tsv;
}

function randomInArray(array) {
  return array[Math.floor(Math.random() * (array.length - 1))];
}

async function something() {
  const entry = await getData("תורה");
  const data = { cards: [entry] };
  console.log(exportToAnki(data));
}

// something();
