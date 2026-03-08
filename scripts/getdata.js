const partsofspeech = new Set([
  "n",
  "adj",
  "adv",
  "mn",
  "abs",
  "art",
  "attrib",
  "auxil",
  "comp",
  "copul",
  "cst",
  "def",
  "f",
  "fn",
  "imper",
  "imperf",
  "indef art",
  "inf",
  "interj",
  "interr",
  "intr",
  "neut",
  "part",
  "pass",
  "perf",
  "possess",
  "ppart",
  "prep",
  "prespart",
  "prest",
  "pt",
  "sing",
  "subj",
  "tr",
]);

const PROXY_BASE = "https://sefaria-proxy.adamhsefaria.workers.dev";
const isLocal =
  typeof window !== "undefined" && window.location.hostname === "localhost";

function sefariaUrl(path) {
  if (isLocal) return path;
  return PROXY_BASE + path;
}

// function to process a word using all the functions below and return the data to be used in the app
export async function getData(word) {
  const [definition, verses] = await Promise.all([
    getDefinition(word).catch(() => "Definition not available."),
    getVerses(word).catch(() => ({})),
  ]);
  return { word, definition, verses };
}

// Recursively collect all definition strings from a nested senses array
function collectDefinitions(senses, parts = []) {
  if (!Array.isArray(senses)) return parts;
  for (const sense of senses) {
    if (sense.definition) {
      const prefix = sense.number ? `${sense.number}. ` : "";
      parts.push(prefix + sense.definition);
    }
    if (sense.grammar?.verbal_stem) {
      // label the binyan group
      const stem = sense.grammar.verbal_stem.replace(/^[—\-]\s*/, "");
      const subDefs = [];
      collectDefinitions(sense.senses, subDefs);
      if (subDefs.length) {
        parts.push(`[${stem}] ${subDefs.join(" ")}`);
      }
    } else if (sense.senses) {
      collectDefinitions(sense.senses, parts);
    }
  }
  return parts;
}

// function to get the default translation of a word
async function getDefinition(word) {
  try {
    const url = "https://www.sefaria.org/api/words/" + encodeURIComponent(word);
    const data = await fetch(url);
    if (!data.ok) return "Definition not available.";
    const jsonData = await data.json();

    const topSenses = jsonData?.[0]?.content?.senses;
    if (!topSenses) return "Definition not available.";

    let parts = collectDefinitions(topSenses);

    parts = parts.filter((part) => {
      return !partsofspeech.has(part.trim().toLowerCase().replace(".", ""));
    });

    console.log(parts);

    if (parts.length === 0) return "Definition not available.";

    console.log(parts);
    return parts[0];
  } catch (err) {
    console.error("Definition Error:", err);
    return "No definition found.";
  }
}

// function to get
async function getVerses(wordtoSearch) {
  const url = sefariaUrl("/api/search-wrapper");

  const body = {
    query: wordtoSearch,
    type: "text",
    field: "naive_lemmatizer",
    size: 100,
    slop: 10,
    sort_method: "score",
    sort_fields: ["pagesheetrank"],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return {};
    const data = await response.json();
    const hits = data?.hits?.hits;
    if (!Array.isArray(hits)) return {};
    const verses = {};
    const seen = new Set();
    for (let i = 0; i < hits.length; i++) {
      // remove duplicates
      const key = hits[i]._id;
      const keyStart = key.split("(")[0];
      if (seen.has(keyStart)) {
        continue;
      }
      seen.add(keyStart);

      verses[hits[i]._id] =
        hits[i].highlight?.naive_lemmatizer?.join(" ") ?? "";
    }
    return await verses;
  } catch (err) {
    console.error("Search Error:", err);
    return [];
  }
}

// // testing the function not to file
// async function main() {
//         const word = "אמר";

//         // const url = "https://www.sefaria.org/api/search-wrapper" + word;
//         // const testdata = await fetch(url);
//         // const jsonData = await testdata.json();
//         // console.log(jsonData);

//         const data = await getData(word);
//         console.log(data.word + ": " + data.definition + " - " );
//                 for (let i = 0; i < Object.keys(data.verses).length; i++) {
//                         console.log(Object.values(data.verses)[i]);
//                 }

// }
// main();

// import fs from 'fs';
// // testing function to json file
// async function main() {
//         const result = [];
//         const words = ["אמר", "דבר", "עשה", "ראה", "שמע", "הלך", "בא", "נתן", "לקח", "אמרו"];
//         for(let i = 0; i < words.length; i++) {
//                 const data = await getData(words[i]);
//                 const jsonData = JSON.stringify(data, null, 2);
//                 console.log(jsonData);
//                 result.push(data);
//         }

//         const finalJson = {cards : result};
//         console.log(JSON.stringify(finalJson, null, 2));

//         fs.writeFile('example.json', JSON.stringify(finalJson, null, 2), (err) => {
//                 if (err) {
//                         console.error('Error writing to file:', err);
//                 } else {
//                         console.log('Data successfully written to output.json');
//                 }
//         });

// }

// const test = true;
// if (test) {
//         main();
// }
