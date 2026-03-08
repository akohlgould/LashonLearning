import data from "./data.json";

function exportToAnki(data) {
  const cards = data.cards;
  const tsv = "";
  for (const card of cards) {
    const index = Math.floor(Math.random() * card.verses.length);
    const back = `${card.definition}\n${card.verses[index]}`;
    tsv.concat(`${card.word}\t${back}\n`);
  }
  return tsv;
}

console.log(exportToAnki(data));
