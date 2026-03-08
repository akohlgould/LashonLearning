// function to process a word using all the functions below and return the data to be used in the app
export async function getData(word) {
        
        return { word: word, definition: await getDefinition(word), verses: await getVerses(word) };
}

// function to get the default translation of a word
async function getDefinition(word) {
        try {
        const url = "https://www.sefaria.org/api/words/" + word;
        // get the data from the url
        const data = await fetch(url);
        const jsonData = await data.json();
        // get the definition of the word
        const definition = jsonData[0].content.senses[0].definition;
        return definition;}
        catch (err) {     
                console.error("Definition Error:", err);
                return "No definition found.";
        }
}

// function to get 
async function getVerses(wordtoSearch){ 
        const url = "https://www.sefaria.org/api/search-wrapper";
  
        const body = {
                "query": wordtoSearch,
                "type": "text",
                "field": "naive_lemmatizer",
                "size": 100,
                "slop": 10,
                "sort_method": "score",
                "sort_fields": ["pagesheetrank"]
        };

        try {
                const response = await fetch(url, {
                        method: "POST",
                        headers: { "accept": "application/json","content-type": "application/json"},
                        body: JSON.stringify(body)
                });

                const data = await response.json();
                const verses = {};
                const seen = new Set();
                for (let i = 0; i < data.hits.hits.length; i++) {
                        // remove duplicates 
                        const key = data.hits.hits[i]._id;
                        const keyStart = key.split("(")[0];
                        if (seen.has(keyStart)) {
                                continue;
                        }
                        seen.add(keyStart);


                        verses[data.hits.hits[i]._id] = data.hits.hits[i].highlight.naive_lemmatizer.join(" ");
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


