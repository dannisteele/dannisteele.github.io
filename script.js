// Import the functions you need from the SDKs you need
import { initializeApp } from "/firebase/app";
import { getAnalytics } from "/firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoRo1f9n6QnN3COO0bYi1MCj3dR347PHM",
  authDomain: "ultimate-eurovision.firebaseapp.com",
  projectId: "ultimate-eurovision",
  storageBucket: "ultimate-eurovision.appspot.com",
  messagingSenderId: "122256875778",
  appId: "1:122256875778:web:889087eeff74ce633c621b",
  measurementId: "G-YHNSC82QCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get DOM elements
const numOfPlayersInput = document.getElementById('numOfPlayers');
const playerNamesDiv = document.getElementById('playerNames');
const resultDiv = document.getElementById('result');
const socialDiv = document.getElementById('social');
const resetbutton = document.getElementById('reset');
const finalistsDiv = document.getElementById('finalists');
const finalistsCheckbox = document.getElementById('finalistsCheckbox');
const csvFileInput = document.getElementById('csvFileInput');
const firstSection = document.getElementById('untilStartAllocation');
const secondSection = document.getElementById('untilAllocateCountries');
const allocateButton = document.getElementById('allocateButton');
const allocateDiv = document.getElementById('allocate');
const whatsappLink = document.getElementById('whatsappLink');
const twitterLink = document.getElementById('twitterLink');

// Check if the device is a mobile device
const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);



// Add event listener to numOfPlayersInput
numOfPlayersInput.addEventListener('keyup', handleNumOfPlayersKeyUp);

function handleNumOfPlayersKeyUp(event) {
    if (event.key === 'Enter') {
        startAllocation();
    }
}

// Add event listener to csvFileInput
csvFileInput.addEventListener('change', handleCsvFileInputChange);

function handleCsvFileInputChange() {
    checkIfFinalists();
    finalistsCheckbox.checked = false;
}

// Add event listener to playerNamesDiv
playerNamesDiv.addEventListener('keyup', handlePlayerNamesKeyUp);

function handlePlayerNamesKeyUp(event) {
    if (event.key === 'Enter') {
        allocateCountries();
    }
}

checkIfFinalists();

// The function to initialize the country allocation process
function startAllocation() {
    const numOfPlayersValue = numOfPlayersInput.value.trim(); // Get the value of the numOfPlayersInput and remove any leading/trailing whitespace

    // Initialize the numOfPlayers variable
    let numOfPlayers;

    // Check if the numOfPlayersValue is empty
    if (numOfPlayersValue === '') {
        alert('Number of players must be provided. Please try again.');
        return;
    }

    // Parse the numOfPlayersValue and check if it's a valid whole integer greater than 0
    numOfPlayers = parseFloat(numOfPlayersValue);
    if (Number.isNaN(numOfPlayers) || !Number.isInteger(numOfPlayers) || numOfPlayers <= 0) {
        alert('Number of players must be a valid whole integer greater than 0. Please try again.');
        return;
    }

    // Clear the playerNamesDiv and add the required number of player name inputs
    playerNamesDiv.innerHTML = '';
    for (let i = 0; i < numOfPlayers; i++) {
        const playerNameInput = document.createElement('input');
        playerNameInput.type = 'text';
        playerNameInput.placeholder = `Enter name for Player ${i + 1}`;
        playerNamesDiv.appendChild(playerNameInput);
    }
    playerNamesDiv.style.display = 'block';

    // Clear the allocateDiv and add the allocateButton
    allocateDiv.innerHTML = '';
    allocateDiv.appendChild(allocateButton);

    // Focus on the first player input if not on a mobile device
    const firstPlayerInput = playerNamesDiv.querySelector('input[type=text]');
    if (firstPlayerInput && !isMobileDevice) {
        firstPlayerInput.focus();
    }

    // Set the href attribute for the whatsappLink and twitterLink
    const customText = "A free and easy Eurovision sweepstake!";
    whatsappLink.href = `whatsapp://send?text=${encodeURIComponent(`${customText} - https://dannisteele.github.io`)}`;
    twitterLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${customText} - https://dannisteele.github.io`)}`;

    // Display the allocateDiv
    allocateDiv.style.display = 'block';

    // Hide the firstSection and display the secondSection if isMobileDevice is true
    if (isMobileDevice) {
        firstSection.style.display = 'none';
        secondSection.style.display = 'block';
    }
}

// Function to allocate countries to players
function allocateCountries() {
    // Convert the player input elements to an array and extract the names
    const playerInputs = Array.from(playerNamesDiv.getElementsByTagName('input'));
    const playerNames = playerInputs.map(input => input.value.trim());

    // Remove focus from all input elements
    document.querySelectorAll('input').forEach(input => input.blur());

    // Check for empty names and assign default names if needed
    const formattedPlayerNames = playerNames.map((name, index) => name !== '' ? name : `Player ${index + 1}`);

    // Get the selected year and read the CSV file
    const selectedYear = csvFileInput.value;
    readCSVFromPath(selectedYear)
        .then(data => {
            console.log(data);

            // Parse the CSV data and extract the required information
            let countries = data.map(row => ({
                name: row[2].trim().replace(/"/g, ''),
                artist: row[3].trim().replace(/"/g, ''),
                song: row[4].trim().replace(/"/g, ''),
                runningOrder: row[5].trim().replace(/"/g, ''),
                youtube: row[11].trim().replace(/"/g, ''),
                appleMusic: row[12].trim().replace(/"/g, ''),
                spotify: row[13].trim().replace(/"/g, '')
            }));

            // Filter the countries based on the finalistsCheckbox status
            let filteredCountries = [];
            if (finalistsCheckbox.checked) {
                if (countries.some(country => country.runningOrder.trim() !== "")) {
                    countries.forEach(country => {
                        if (country.runningOrder.trim() !== "") {
                            filteredCountries.push(country);
                        }
                    });
                } else {
                    console.log("Empty filtered list, using the original list");
                    filteredCountries = countries;
                }
            } else {
                filteredCountries = countries;
            }

            // Check if there are more players than countries
            if (formattedPlayerNames.length > filteredCountries.length) {
                // Display a warning message if there are more players than countries
                alert('Warning: There are more players than countries. Some players will not receive a country.');
            }

            // Allocate countries to players and build the allocationResult array
            const allocationResult = allocateCountriesBuilder(formattedPlayerNames, filteredCountries);

            // Display the allocation result
            resultDiv.innerHTML = "";
            for (let i = 0; i < allocationResult.length; i++) {
                const formattedPlayerName = `***${formattedPlayerNames[i].toUpperCase()}***`;
                resultDiv.innerHTML += `<h3>${formattedPlayerName}</h3>`;
                for (const country of allocationResult[i]) {
                    resultDiv.innerHTML += `<p>${country}</p>`;
                }
                resultDiv.style.display = 'block';
                resultDiv.innerHTML += `<br>`;
                resultDiv.innerHTML += `<br>`;
            }
            resultDiv.style.display = 'block';
            socialDiv.style.display = 'block'; // Display the #social div
            resetbutton.style.display = 'block';

            // Hide the secondSection if isMobileDevice is true
            if (isMobileDevice) {
                secondSection.style.display = 'none';
            }

            // Scroll to the resultDiv
            smoothScroll(resultDiv)
        })
        .catch(error => {
            console.error('Error reading CSV file:', error);
            alert('Error reading CSV file. Please check the file path or URL.');
        });
}

// Function to shuffle the elements of an array in-place
// -----------------------------------------------------
// This function takes an array as an argument and shuffles its elements
// in a random order, utilizing the Fisher-Yates algorithm. The
// shuffled array is returned as the output.
function shuffleArray(array) {
    // Iterate over the array from the last element to the second one
    for (let i = array.length - 1; i > 0; i--) {

        // Generate a random index j, ensuring it's within the array bounds
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to allocate countries to players and generate display text
// ------------------------------------------------------------------
// This function takes an array of player names and an array of countries as input,
// shuffles the countries array, and allocates countries to each player.
// The allocation is based on dividing the total number of countries equally
// among the players and distributing any remaining countries randomly.
// The function returns an array of display texts for each player,
// containing the country name, artist, song, and links to YouTube, Apple Music,
// and Spotify, if available.
function allocateCountriesBuilder(playerNames, countries) {
    let allocationResult = [];

    // Shuffle the countries array
    shuffleArray(countries);

    let totalCountries = countries.length;
    let countriesPerPlayer = Math.floor(totalCountries / playerNames.length);
    let surplusCountries = totalCountries % playerNames.length;

    // Define image source paths
    let youtubePng = "resources/youtube.png";
    let appleMusicPng = "resources/apple_music.png";
    let spotifyPng = "resources/spotify.png";

    let startIndex = 0;

    for (let i = 0; i < playerNames.length; i++) {
        let endIndex = startIndex + countriesPerPlayer + (surplusCountries > 0 ? 1 : 0);

        // Generate display text for each country allocated to the player
        allocationResult.push(countries.slice(startIndex, endIndex).map(country => {
            let displayText = `${country.name.toUpperCase().replace(/"/g, '')}<br>`;
            if (country.artist) {
                displayText += `${country.artist.replace(/"/g, '')}`;
            }
            if (country.song) {
                displayText += `: ${country.song.replace(/"/g, '')}`;
            }
            displayText += "<br>";

            // Add links to YouTube, Apple Music, and Spotify, if available
            if (country.youtube !== "") {
                displayText += `<a href="${country.youtube}" target="_blank"><img src=${youtubePng} /></a>`;
            }
            if (country.appleMusic !== "") {
                displayText += `<a href="${country.appleMusic}" target="_blank"><img src=${appleMusicPng} /></a>`;
            }
            if (country.spotify !== "") {
                displayText += `<a href="${country.spotify}" target="_blank"><img src=${spotifyPng} /></a>`;
            }

            // Return the trimmed display text
            return displayText.trim();
        }));

        startIndex = endIndex;
        surplusCountries--;
    }
    return allocationResult;
}

// Function to read CSV data from a specified GitHub raw content URL
// ---------------------------------------------------------------
// This function takes a selected year as input and returns a Promise
// that resolves with an array of arrays containing the parsed CSV data.
// The function fetches the CSV file from the specified GitHub raw content URL,
// parses the content, and removes the header row before resolving the Promise.
function readCSVFromPath(selectedYear) {
    return new Promise((resolve, reject) => {
        // Specify the GitHub raw content URL for the selected year
        let csvFilePath = `https://raw.githubusercontent.com/dannisteele/Eurovision-allocator/main/Set_Lists/CSV/${selectedYear}.csv`;

        fetch(csvFilePath)
            .then(response => {
                // If the response is not successful, throw an error
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                // Parse the CSV data and remove the header row
                let parsedData = parseCSV(data);
                parsedData.shift();
                resolve(parsedData);
            })
            .catch(error => {
                // Reject the Promise with the error object
                reject(error);
            });
    });
}

// Function to parse CSV text into an array of arrays
// ------------------------------------------------
// This function takes a CSV text string as input and returns an array of arrays
// containing the parsed CSV data. The function first splits the input text
// into rows using newline characters, filters out any empty rows, and then
// maps each row to an array of columns by splitting the row using semicolon
// characters. The function trims any leading or trailing whitespace from each
// column before returning the final array of arrays.
function parseCSV(csvText) {
    let rows = csvText.split('\n');

    // Filter out empty rows
    rows = rows.filter(row => row.trim() !== '');

    return rows.map(row => {
        let columns = row.split(';');

        // Trim whitespace from each column
        return columns.map(column => column.trim());
    });
}

// Function to smoothly scroll to a target element with optional duration and easing
// --------------------------------------------------------------------------
// This function takes an element to scroll to, an optional duration for the scroll
// animation, and an optional easing function. The function calculates the target
// scroll position, defines a custom easing function, and uses requestAnimationFrame
// to smoothly scroll to the target position. The default duration is 1200ms, and
// the default easing function is 'easeInOutQuad'.
function smoothScroll(element, duration = 1200, easing = 'easeInOutQuad') {
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

    // Define the custom easing function
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(scroll);
}

// Function to reset the application to its initial state
function resetApp() {
    // Reset the number of players input
    numOfPlayersInput.value = '';

    // Remove the file input and player name inputs
    playerNamesDiv.innerHTML = '';

    // Hide the player names, allocation, result, and social divs
    playerNamesDiv.style.display = 'none';
    allocateDiv.style.display = 'none';
    resultDiv.style.display = 'none';
    socialDiv.style.display = 'none';
    resetbutton.style.display = 'none';
    finalistsDiv.style.display = 'none';

    if (isMobileDevice) {
        firstSection.style.display = 'block';
    }

    checkIfFinalists();
}

function checkIfFinalists() {
    let selectedYear = csvFileInput.value;
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

        // Check if there are both finalists and non-finalists in the data
        let hasFinalists = countries.some(country => country.runningOrder !== "");
        let hasNonFinalists = countries.some(country => country.runningOrder === "");

        if (hasFinalists && hasNonFinalists) {
            finalistsDiv.style.display = 'block';
        } else {
            finalistsDiv.style.display = 'none';
        }

    }).catch(error => {
        console.error('Error reading CSV file:', error);
        alert('Error reading CSV file. Please check the file path or URL.');
    });
}

// Function to escape HTML special characters
function escapeHtml(text) {
    let map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

function newUser() {
    const usernameInput = document.getElementById("usernameInputField");
    const passwordInput = document.getElementById("passwordInputField");
    database.ref('users/' + usernameInput.value).set({
        username: usernameInput.value,
        password: passwordInput.value
    })
    alert("Saved");
}