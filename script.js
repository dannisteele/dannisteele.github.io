let numOfPlayersInput = document.getElementById('numOfPlayers');
let playerNamesDiv = document.getElementById('playerNames');
let resultDiv = document.getElementById('result');

function readCSV(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = (event) => {
            let content = event.target.result;
            let rows = content.split('\n');
            let data = rows.map(row => {
                let columns = row.split(',');
                // Trim each column
                return columns.map(col => col.trim());
            });
            resolve(data);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

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
    let playerNames = Array.from(playerNamesDiv.getElementsByTagName('input')).map(input => input.value.trim());

    if (playerNames.every(name => name !== '')) {
        let selectedYear = document.getElementById('csvFileInput').value;
        readCSVFromPath(selectedYear).then(data => {
            console.log(data); // Log the data to the console

            // Assuming the CSV structure: Country,Artist,Song
            let countries = data.map(row => ({
                name: row[0].trim(),
                artist: row[1].trim(),
                song: row[2].trim()
            }));

            // Simulate the allocation logic
            let allocationResult = allocateCountriesSimulated(playerNames, countries);

            // Display the result
            resultDiv.innerHTML = `<h2>Allocation Result:</h2>`;
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
        }).catch(error => {
            console.error('Error reading CSV file:', error);
            alert('Error reading CSV file. Please check the file path or URL.');
        });
    } else {
        alert('Please enter names for all players.');
    }
}


// Simulated function, replace it with the actual logic in your Java code
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

    console.log(countries); // Log the content of countries array

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
        let csvFilePath = `https://raw.githubusercontent.com/dannisteele/Eurovision-allocator/f820a2fcbe8763ddcabdfac142dd90725981c27c/Set_Lists/CSV/${selectedYear}.csv`;

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
    return rows.map(row => {
        let columns = row.split(',');
        return columns.map(column => column.trim());
    });
}

