import { getData } from "./getdata.js";

async function exportToAnki(data) {
  const cards = data.cards;
  let tsv = "";
  for (const card of cards) {
    const randomRef = randomInArray(card.refs);
    const verse = await getVerse(randomRef);
    const back = `${card.definition};${verse}`;
    tsv = tsv.concat(`${card.word}\t${back}\n`);
  }
  return tsv;
}

function randomInArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function something() {
  const entry = await getData("תורה");
  const data = { cards: [entry] };
  console.log(exportToAnki(data));
}

something();
