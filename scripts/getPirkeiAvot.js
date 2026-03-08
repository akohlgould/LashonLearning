async function getPirkeiAvot() {
  const url = "https://www.sefaria.org/api/v3/texts/Avot 3";
  const data = await fetch(url);
  const jsonData = await data.json();
  const texts = jsonData.versions[0].text;
  return { texts: texts };
}

async function main() {
  const text = await getPirkeiAvot();
  console.log(JSON.stringify(text));
}

main();
