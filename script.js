let numOfPlayersInput = document.getElementById('numOfPlayers');
let playerNamesDiv = document.getElementById('playerNames');
let resultDiv = document.getElementById('result');
let socialDiv = document.getElementById('social');
let resetbutton = document.getElementById('reset')
let finalistsCheckbox = document.getElementById('finalistsCheckbox');


numOfPlayersInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        startAllocation();
    }
});

playerNamesDiv.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        allocateCountries();
    }
});

function startAllocation() {
    let numOfPlayers = parseInt(numOfPlayersInput.value);
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    playerNamesDiv.appendChild(fileInput);

    if (numOfPlayers > 0) {
        playerNamesDiv.innerHTML = '';

        for (let i = 0; i < numOfPlayers; i++) {
            let playerNameInput = document.createElement('input');
            playerNameInput.type = 'text';
            playerNameInput.placeholder = `Enter name for Player ${i + 1}`;
            playerNamesDiv.appendChild(playerNameInput);
        }

        playerNamesDiv.style.display = 'block';

        // Create the "Allocate Countries" button
        let allocateButton = document.createElement('button');
        allocateButton.textContent = 'Allocate Countries';
        allocateButton.onclick = allocateCountries;

        // Append the button to the #allocate div
        let allocateDiv = document.getElementById('allocate');
        allocateDiv.innerHTML = '';
        allocateDiv.appendChild(allocateButton);

        // Focus on the first player input
        let firstPlayerInput = playerNamesDiv.querySelector('input[type=text]');
        if (firstPlayerInput) {
            firstPlayerInput.focus();
        }

        let whatsappLink = document.getElementById('whatsappLink');
        let customText = "A free and easy Eurovision sweepstake!";
        whatsappLink.href = `whatsapp://send?text=${encodeURIComponent(`${customText} - https://dannisteele.github.io`)}`;

        let twitterLink = document.getElementById('twitterLink');
        twitterLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${customText} - https://dannisteele.github.io`)}`

        allocateDiv.style.display = 'block'; // Display the #allocate div

    } else {
        alert('Number of players must be greater than 0. Please try again.');
    }
}

function allocateCountries() {
    let playerInputs = Array.from(playerNamesDiv.getElementsByTagName('input'));
    let playerNames = playerInputs.map(input => input.value.trim());

    // Remove focus from all input elements
    document.querySelectorAll('input').forEach(input => input.blur());

    // Check for empty names and assign default names if needed
    playerNames = playerNames.map((name, index) => name !== '' ? name : `Player ${index + 1}`);

    let selectedYear = document.getElementById('csvFileInput').value;
    readCSVFromPath(selectedYear).then(data => {
        console.log(data);


        let countries = data.map(row => {
            return {
                name: row[1].trim(),
                artist: row[2].trim(),
                song: row[3].trim(),
                runningOrder: row[5].trim()
            };
        });
        
        if (finalistsCheckbox.checked) {
            // Apply filter only if the list is not empty
            if (countries.some(country => country.runningOrder !== "NULL")) {
                countries = countries.filter(country => country.runningOrder !== "NULL");
            } else {
                // If the filtered list is empty, use the original list
                console.log("Empty filtered list, using the original list");
            }
        }

        if (playerNames.length > countries.length) {
            // Display a warning message if there are more players than countries
            alert('Warning: There are more players than countries. Some players will not receive a country.');
        }

        let allocationResult = allocateCountriesSimulated(playerNames, countries);

        resultDiv.innerHTML = "";
        for (let i = 0; i < allocationResult.length; i++) {
            let formattedPlayerName = `***${playerNames[i].toUpperCase()}***`;
            resultDiv.innerHTML += `<h3>${formattedPlayerName}</h3>`;
            for (let country of allocationResult[i]) {
                resultDiv.innerHTML += `<p>${country}</p>`;
            }
            resultDiv.style.display = 'block';
            resultDiv.innerHTML += `<br>`;
            resultDiv.innerHTML += `<br>`;
        }
        socialDiv.style.display = 'block'; // Displat the #social div
        resetbutton.style.display = 'block';
        smoothScroll(resultDiv)
    }).catch(error => {
        console.error('Error reading CSV file:', error);
        alert('Error reading CSV file. Please check the file path or URL.');
    });
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function allocateCountriesSimulated(playerNames, countries) {
    let allocationResult = [];

    // Assuming each country has a name, artist, and song
    shuffleArray(countries);

    let totalCountries = countries.length;
    let countriesPerPlayer = Math.floor(totalCountries / playerNames.length);
    let surplusCountries = totalCountries % playerNames.length;

    let startIndex = 0;

    for (let i = 0; i < playerNames.length; i++) {
        let endIndex = startIndex + countriesPerPlayer + (surplusCountries > 0 ? 1 : 0);

        allocationResult.push(countries.slice(startIndex, endIndex).map(country => {
            let displayText = `${country.name.toUpperCase().replace(/"/g, '')}<br>`;
            if (country.artist) {
                displayText += `${country.artist.replace(/"/g, '')}`;
            }
            if (country.song) {
                displayText += `: ${country.song.replace(/"/g, '')}`;

            }
            return displayText;
        }));

        startIndex = endIndex;
        surplusCountries--;
    }
    return allocationResult;
}

function readCSVFromPath(selectedYear) {
    return new Promise((resolve, reject) => {
        // Specify the GitHub raw content URL for the selected year
        let csvFilePath = `https://raw.githubusercontent.com/dannisteele/Eurovision-allocator/main/Set_Lists/CSV/${selectedYear}.csv`;

        fetch(csvFilePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                let parsedData = parseCSV(data);
                parsedData.shift();
                resolve(parsedData);
            })
            .catch(error => {
                reject(error);
            });
    });
}


function parseCSV(csvText) {
    let rows = csvText.split('\n');
    // Filter out empty rows
    rows = rows.filter(row => row.trim() !== '');

    return rows.map(row => {
        let columns = row.split(',');
        return columns.map(column => column.trim());
    });
}

function smoothScroll(element, duration = 2000, easing = 'easeInOutQuad') {
    const start = window.scrollY || window.pageYOffset;
    const target = element.getBoundingClientRect().top + start;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

    function scroll() {
        const currentTime = 'now' in window.performance ? performance.now() : new Date().getTime();
        const timeElapsed = currentTime - startTime;

        window.scrollTo(0, easeInOutQuad(timeElapsed, start, target - start, duration));

        if (timeElapsed < duration) {
            requestAnimationFrame(scroll);
        }
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(scroll);
}

function resetApp() {
    // Reset the number of players input
    numOfPlayersInput.value = '';

    // Remove the file input and player name inputs
    playerNamesDiv.innerHTML = '';

    // Hide the player names, allocation, result, and social divs
    playerNamesDiv.style.display = 'none';
    document.getElementById('allocate').style.display = 'none';
    resultDiv.style.display = 'none';
    socialDiv.style.display = 'none';
    resetbutton.style.display = 'none';
}