
// function to process a word using all the functions below and return the data to be used in the app
async function getData(word) {
        const url = "https://www.sefaria.org/api/words/" + word;
        // get the data from the url
        const data = await fetch(url);
        const jsonData = await data.json();
        return { word: word, definition: getDefinition(jsonData), refs: getRefs(jsonData) };
}


// function to get the default translation of a word
function getDefinition(word){
        // get the definition of the word
        const definition = word[0].content.senses[0].definition;
        return definition;
        
}

// function to get 
function getRefs(word){
        // get a random verse from the tanakh
        const data = word[0].refs;


        return data;
}

// // testing the function
// async function main() {
//         const word = "אמר";


//         const url = "https://www.sefaria.org/api/search-wrapper" + word;
//         const testdata = await fetch(url);
//         const jsonData = await testdata.json();
//         console.log(jsonData);

//         data = await getData(word);
//         console.log(data.word + ": " + data.definition + " - " + data.refs); 
        
// }
// main();