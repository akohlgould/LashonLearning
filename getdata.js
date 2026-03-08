
// function to process a word using all the functions below and return the data to be used in the app
async function getData(word) {
        const url = "https://www.sefaria.org/api/words/" + word;
        // get the data from the url
        const data = await fetch(url);
        const jsonData = await data.json();
        return { word: word, definition: getDefinition(jsonData), randomVerse: getRandomVerse(jsonData) };
}


// function to get the default translation of a word
function getDefinition(word){
        // get the definition of the word
        const definition = word[0].content.senses[0].definition;
        return definition;
        
}

// function to get 
function getRandomVerse(word){
        // get a random verse from the tanakh
        return word[0].refs[0];
}

// // testing the function
// async function main() {
//         data = await getData("תורה");
//         console.log(data.word + ": " + data.definition + " - " + data.randomVerse); 
        
// }
// main();