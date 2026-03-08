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

const CACHE_KEY = "lashonLearning_wordCache";
const MAX_CACHE_SIZE = 100;

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { entries: {}, order: [] };
    return JSON.parse(raw);
  } catch {
    return { entries: {}, order: [] };
  }
}

function setCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

function getCachedWord(word) {
  const cache = getCache();
  if (!(word in cache.entries)) return null;
  // Move to end (most recently used)
  cache.order = cache.order.filter((w) => w !== word);
  cache.order.push(word);
  setCache(cache);
  return cache.entries[word];
}

function cacheWord(word, data) {
  const cache = getCache();
  // Evict oldest entries if at capacity
  while (cache.order.length >= MAX_CACHE_SIZE) {
    const oldest = cache.order.shift();
    delete cache.entries[oldest];
  }
  cache.entries[word] = { definition: data.definition, verses: data.verses };
  cache.order = cache.order.filter((w) => w !== word);
  cache.order.push(word);
  setCache(cache);
}

// --- Custom definition overrides (user-selected from Explore page) ---
const CUSTOM_DEF_KEY = "lashonLearning_customDefinitions";

export function getCustomDefinition(word) {
  try {
    const raw = localStorage.getItem(CUSTOM_DEF_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[word] || null;
  } catch {
    return null;
  }
}

export function setCustomDefinition(word, text) {
  try {
    const raw = localStorage.getItem(CUSTOM_DEF_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[word] = text;
    localStorage.setItem(CUSTOM_DEF_KEY, JSON.stringify(map));
  } catch {
    // storage full or unavailable
  }
}

export function clearCustomDefinition(word) {
  try {
    const raw = localStorage.getItem(CUSTOM_DEF_KEY);
    if (!raw) return;
    const map = JSON.parse(raw);
    delete map[word];
    localStorage.setItem(CUSTOM_DEF_KEY, JSON.stringify(map));
  } catch {
    // silently ignore
  }
}

// function to process a word using all the functions below and return the data to be used in the app
export async function getData(word) {
  const customDef = getCustomDefinition(word);

  const cached = getCachedWord(word);
  if (cached) {
    return { word, definition: customDef || cached.definition, verses: cached.verses };
  }

  const [definition, verses] = await Promise.all([
    getDefinition(word).catch(() => "Definition not available."),
    getVerses(word).catch(() => ({})),
  ]);
  const result = { word, definition, verses };
  cacheWord(word, result);
  return { word, definition: customDef || definition, verses };
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

// function to get verses where the word appears
export async function getVerses(wordtoSearch) {
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

// Language mapping from parent_lexicon_details.language
const LANGUAGE_MAP = {
  "heb.modern": "Modern Hebrew",
  "heb.biblical": "Biblical Hebrew",
  "heb.talmudic": "Talmudic/Rabbinic",
  "ara.biblical": "Biblical Aramaic",
};

// Sense language codes from Klein Dictionary
const SENSE_LANGUAGE_MAP = {
  PBH: "Post-Biblical Hebrew",
  NH: "New/Modern Hebrew",
  MH: "Mishnaic Hebrew",
};

// Strip HTML tags to get plain text
export function stripHtml(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

// Extract Hebrew headwords from Klein refs like "Klein Dictionary, תּוֹרִי 1"
function extractHeadwordsFromRefs(refs) {
  if (!Array.isArray(refs)) return [];
  const seen = new Set();
  const results = [];
  for (const ref of refs) {
    const match = ref.match(/^Klein Dictionary,\s+(.+?)\s*\d*$/);
    if (match) {
      const hw = match[1].replace(/\s*[ᴵᴵᴵ]+$/, "").trim();
      if (!seen.has(hw)) {
        seen.add(hw);
        results.push(hw);
      }
    }
  }
  return results;
}

// Extract derivative words from Klein derivatives HTML string
function extractDerivatives(derivativesHtml) {
  if (!derivativesHtml) return [];
  const doc = new DOMParser().parseFromString(derivativesHtml, "text/html");
  const links = doc.querySelectorAll("a[data-ref]");
  const results = [];
  const seen = new Set();
  links.forEach((link) => {
    const text = link.textContent.trim();
    if (text && !seen.has(text)) {
      seen.add(text);
      results.push(text);
    }
  });
  return results;
}

// Try to extract the shoresh (root) from Klein notes
function extractShoresh(notes) {
  if (!notes) return null;
  const doc = new DOMParser().parseFromString(notes, "text/html");
  // Look for root verb references — patterns like "Hiph. of ירה" or "Qal of כתב"
  const links = doc.querySelectorAll("a.refLink[data-ref]");
  for (const link of links) {
    const ref = link.getAttribute("data-ref") || "";
    // Klein Dictionary verb entries look like "Klein Dictionary, ירה ᴵ 1"
    const match = ref.match(/^Klein Dictionary,\s+([א-ת]+)/);
    if (match) {
      const root = match[1];
      // Only return 2-4 letter roots (Hebrew shoresh)
      if (root.length >= 2 && root.length <= 4) {
        return root;
      }
    }
  }
  return null;
}

// Collect senses into a flat displayable array preserving structure
function collectSensesForDisplay(senses, depth = 0) {
  if (!Array.isArray(senses)) return [];
  const result = [];
  for (const sense of senses) {
    if (sense.definition) {
      result.push({
        number: sense.number || null,
        definition: sense.definition,
        languageCode: sense.language_code || null,
        depth,
      });
    }
    if (sense.grammar?.verbal_stem) {
      const stem = sense.grammar.verbal_stem.replace(/^[—\-]\s*/, "");
      const subSenses = collectSensesForDisplay(sense.senses, depth + 1);
      result.push({ stem, subSenses, depth });
    } else if (sense.senses) {
      result.push(...collectSensesForDisplay(sense.senses, depth + 1));
    }
  }
  return result;
}

export async function getImportantLexiconInformation(word) {
  const url = "https://www.sefaria.org/api/words/" + encodeURIComponent(word);
  const response = await fetch(url);
  if (!response.ok) return null;
  const entries = await response.json();
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const result = {
    headword: entries[0].headword || word,
    transliteration: null,
    pronunciation: null,
    strongNumber: null,
    morphology: null,
    shoresh: null,
    etymology: null,
    derivatives: [],
    relatedEntries: [],
    languagePeriods: [],
    definitionsBySource: [],
    pluralForm: [],
    prevHeadword: null,
    nextHeadword: null,
  };

  const languagePeriods = new Set();

  for (const entry of entries) {
    const lexicon = entry.parent_lexicon;
    const lang = entry.parent_lexicon_details?.language;
    if (lang && LANGUAGE_MAP[lang]) {
      languagePeriods.add(LANGUAGE_MAP[lang]);
    }

    if (lexicon === "Klein Dictionary") {
      // Morphology
      if (!result.morphology && entry.content?.morphology) {
        result.morphology = entry.content.morphology;
      }
      // Etymology from notes
      if (!result.etymology && entry.notes) {
        result.etymology = stripHtml(entry.notes);
        result.shoresh = extractShoresh(entry.notes);
      }
      // Derivatives
      if (entry.derivatives && result.derivatives.length === 0) {
        result.derivatives = extractDerivatives(entry.derivatives);
      }
      // Related entries from refs
      if (entry.refs && result.relatedEntries.length === 0) {
        result.relatedEntries = extractHeadwordsFromRefs(entry.refs);
      }
      // Navigation
      if (!result.prevHeadword && entry.prev_hw) result.prevHeadword = entry.prev_hw;
      if (!result.nextHeadword && entry.next_hw) result.nextHeadword = entry.next_hw;

      // Definitions
      if (entry.content?.senses) {
        result.definitionsBySource.push({
          source: "Klein Dictionary",
          language: LANGUAGE_MAP[lang] || "Hebrew",
          morphology: entry.content.morphology || null,
          senses: collectSensesForDisplay(entry.content.senses),
        });
      }
    } else if (lexicon === "BDB Augmented Strong") {
      // Skip proper nouns
      if (entry.language_code === "x-pn") continue;

      if (!result.transliteration && entry.transliteration) {
        result.transliteration = entry.transliteration;
      }
      if (!result.pronunciation && entry.pronunciation) {
        result.pronunciation = entry.pronunciation;
      }
      if (!result.strongNumber && entry.strong_number) {
        result.strongNumber = entry.strong_number;
      }

      if (entry.content?.senses) {
        result.definitionsBySource.push({
          source: "BDB Augmented Strong",
          language: LANGUAGE_MAP[lang] || "Biblical Hebrew",
          morphology: entry.content.morphology || null,
          senses: collectSensesForDisplay(entry.content.senses),
        });
      }
    } else if (lexicon === "Jastrow Dictionary") {
      if (entry.plural_form?.length) {
        result.pluralForm = entry.plural_form;
      }
      if (entry.content?.senses) {
        result.definitionsBySource.push({
          source: "Jastrow Dictionary",
          language: "Talmudic/Rabbinic",
          morphology: entry.content.morphology || null,
          senses: collectSensesForDisplay(entry.content.senses),
        });
      }
    } else if (lexicon === "BDB Dictionary") {
      if (entry.content?.senses) {
        result.definitionsBySource.push({
          source: "BDB Dictionary",
          language: LANGUAGE_MAP[lang] || "Biblical Hebrew",
          morphology: entry.content?.senses?.[0]?.definition?.match(/^<strong>(.*?)<\/strong>/)?.[1] || null,
          senses: collectSensesForDisplay(entry.content.senses),
        });
      }
    }
  }

  result.languagePeriods = [...languagePeriods];

  // Fallback morphology from any entry
  if (!result.morphology) {
    for (const entry of entries) {
      if (entry.content?.morphology) {
        result.morphology = entry.content.morphology;
        break;
      }
    }
  }

  return result;
}