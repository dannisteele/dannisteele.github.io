let numOfPlayersInput = document.getElementById('numOfPlayers');
let playerNamesDiv = document.getElementById('playerNames');
let resultDiv = document.getElementById('result');

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
        allocateDiv.innerHTML = ''; // Clear existing content
        allocateDiv.appendChild(allocateButton);

        allocateDiv.style.display = 'block'; // Display the #allocate div

    } else {
        alert('Number of players must be greater than 0. Please try again.');
    }
}

function allocateCountries() {
    let playerInputs = Array.from(playerNamesDiv.getElementsByTagName('input'));
    let playerNames = playerInputs.map(input => input.value.trim());

    // Check for empty names and assign default names if needed
    playerNames = playerNames.map((name, index) => name !== '' ? name : `Player ${index + 1}`);

    let selectedYear = document.getElementById('csvFileInput').value;
    readCSVFromPath(selectedYear).then(data => {
        console.log(data);


        let countries = data.map(row => {
            if (row.length == 3) {
                return {
                    name: row[0].trim(),
                    artist: row[1].trim(),
                    song: row[2].trim()
                };
            }
        });

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
            let displayText = `${country.name.toUpperCase()}<br>`;
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