import { getData } from './getdata.js';
import defaultWords from '../test_words.json';


export async function generateCards() {
    let wordList;
    try {
        const stored = localStorage.getItem('words');
        if (stored) {
            wordList = JSON.parse(stored);
        }
    } catch {
        // ignore parse errors
    }

    if (!Array.isArray(wordList) || wordList.length === 0) {
        wordList = defaultWords;
    }

    const cards = [];

    for (const word of wordList) {
        cards.push(await getData(word));
    }
    
    return cards;
}