
document.getElementById('factForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const personality = document.getElementById('personality').value;

    if (personality) {
        // Send the personality prompt to the server to generate a fact
        const response = await fetch('/randomFact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ personality: personality }) // Fix: Pass personality input value
        });

        // Parse the response JSON
        const data = await response.json();

        document.getElementById('fact').textContent = data.fact;

        // Clear input field
        document.getElementById('personality').value = '';

        // Make other elements visible
        document.getElementById('factBox').classList.remove('hidden');
    }
});

// Function to fetch regions from the server and populate the select dropdown
async function fetchRegions() {
    try {
        // Fetch regions from the server
        const response = await fetch('/regions');

        if (!response.ok) {
            throw new Error('Failed to fetch regions');
        }

        // Parse response JSON
        const regions = await response.json();

        // Select the dropdown element
        const selectElement = document.getElementById('region');

        // Clear existing options
        selectElement.innerHTML = '';

        // Populate dropdown with regions
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching regions:', error);
    }
}



// Call fetchRegions function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', fetchRegions);

// Function to fetch a random fact for the selected region
async function fetchRandomFact(region) {
    try {
        const response = await fetch('/randomFact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ region: region }) // Pass the selected region in the request body
        });
        const data = await response.json();

        // Set the country value in the hidden input field
        document.getElementById('countryValue').value = data.country;

        return data.fact;
    } catch (error) {
        console.error('Error fetching random fact:', error);
        return null;
    }
}


async function fetchFlagByCountryName(countryName) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        if (!response.ok) {
            throw new Error('Failed to fetch flag');
        }
        const data = await response.json();
        return data[0].flags.png;
    } catch (error) {
        console.error('Error fetching flag:', error);
        return null;
    }
}



// Function to evaluate the user's answer using AI
async function evaluateAnswer(answer, fact) {
    try {
        // Make a request to your server to send the user's answer and the generated fact to the AI model
        const response = await fetch('/evaluateAnswer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answer: answer, fact: fact })
        });

        if (!response.ok) {
            throw new Error('Failed to evaluate answer');
        }

        const data = await response.json();
        return data.correct; // Return whether the answer is correct or not
    } catch (error) {
        console.error('Error evaluating answer:', error);
        return false; // Assume answer is incorrect in case of an error
    }
}

async function processAnswer(answer, fact) {
    try {
        const isCorrect = await evaluateAnswer(answer, fact); // Evalueren van het antwoord van de gebruiker
        if (isCorrect) {
            await addPoint(); // Punten toevoegen als het antwoord correct is
            const correctAnswer = answer.trim(); // Het geëvalueerde antwoord gebruiken als het correcte land
            const flagUrl = await fetchFlagByCountryName(correctAnswer); // Vlag ophalen op basis van het correcte antwoord
            if (flagUrl) {
                const flagImg = document.getElementById('flag');
                flagImg.src = flagUrl;
                flagImg.style.display = 'block'; // De vlagafbeelding tonen
            } else {
                throw new Error('Failed to retrieve flag');
            }
        } else {
            // Code om een incorrect antwoord af te handelen
        }
    } catch (error) {
        console.error('Error processing answer:', error);
    }
}




// Modify the event listener for form submission to pass the generated fact along with the user's answer
document.getElementById('factForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const answerInput = document.getElementById('answer');
    const answer = answerInput.value.trim();
    const fact = document.getElementById('fact').textContent; // Retrieve the generated fact
    if (!answer) {
        alert('Please enter your answer');
        return;
    }
    processAnswer(answer, fact);
});

// Rest of your existing code remains unchanged...



// Add an event listener to the form with the ID 'regionForm'
document.getElementById('regionForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const region = document.getElementById('region').value; // Get the selected region

    // Fetch a random fact for the selected region
    const fact = await fetchRandomFact(region);
    if (fact) {
        document.getElementById('fact').textContent = fact; // Display the fact on the screen

        // Make other elements visible
        document.getElementById('factBox').classList.remove('hidden');
        document.getElementById('factForm').classList.remove('hidden');
    } else {
        alert('Failed to fetch a random fact. Please try again.');
    }
});

// Add event listener to the form to process user's answer
document.getElementById('factForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const answerInput = document.getElementById('answer');
    const answer = answerInput.value.trim();
    if (!answer) {
        alert('Please enter your answer');
        return;
    }
    processAnswer(answer);
});

// Functie om een punt toe te voegen voor elk goed geraden land
async function addPoint() {
    try {
        const response = await fetch('/addPoint', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to add point');
        }

        const data = await response.json();
        const points = data.points;

        // Update de puntenweergave op de frontend
        document.getElementById('points').textContent = points;
    } catch (error) {
        console.error('Error adding point:', error);
    }
}

