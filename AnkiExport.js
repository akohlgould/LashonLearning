import { getData } from "./getdata.js";

function exportToAnki(data) {
  const cards = data.cards;
  const tsv = "";
  for (const card of cards) {
    const back = `${card.definition}\n${card.refs}`;
    // console.log(back);
    tsv.concat(`${card.word}\t${back}\n`);
  }
  return tsv;
}

async function something() {
  const entry = await getData("תורה");
  const data = { cards: [entry] };
  console.log(exportToAnki(data));
}

something();
