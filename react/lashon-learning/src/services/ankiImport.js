/**
 * Utilities for turning the TSV file produced by the Anki export
 * feature into a simple array of Hebrew words.  The exported file
 * contains two columns: the front side (the word) plus the back side
 * (definition + random verse).  We only care about the first column.
 */

/**
 * Parse a string of TSV data and return the list of first-column words.
 * Empty lines are ignored.
 *
 * @param {string} text - raw TSV content from Anki export
 * @returns {string[]} array of words
 */
export function parseAnkiTSV(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().split("\t")[0])
    .filter(Boolean);
}

/**
 * Read the contents of a File/Blob and parse its TSV lines.
 *
 * @param {File|Blob} file
 * @returns {Promise<string[]>} words extracted from the file
 */
export async function importAnkiFile(file) {
  const text = await file.text();
  return parseAnkiTSV(text);
}
