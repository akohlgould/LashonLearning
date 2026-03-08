import { getData } from "./getdata.js";

function exportToAnki(data) {
  const cards = data.cards;
  const tsv = "";
  for (const card of cards) {
    const back = `${card.definition}\n${card.randomVerse}`;
    tsv.concat(`${card.word}\t${back}\n`);
  }
  return tsv;
}

async function main() {
  const entry = await getData("תורה");
  const data = { cards: [entry] };
  console.log(data);
  console.log(exportToAnki(data));
}

main();
