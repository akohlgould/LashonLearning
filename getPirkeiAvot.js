async function getPirkeiAvot() {
  const url = "https://www.sefaria.org/api/v3/texts/Avot 3";
  const data = await fetch(url);
  const jsonData = await data.json();
  const text = jsonData.versions[0].text;
  return text;
}

async function main() {
  getPirkeiAvot();
}

main();
