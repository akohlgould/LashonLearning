document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('download');

    downloadBtn.onclick = () => {
        chrome.storage.local.get({ wordList: [] }, (data) => {
            if (data.wordList.length === 0) {
                alert("No words saved yet!");
                return;
            }

            const blob = new Blob([JSON.stringify(data.wordList, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'flashcards.json';
            link.click();

            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(url), 100);
        });
    };
});