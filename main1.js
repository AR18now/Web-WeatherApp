// Chatbot Send Button Logic
document.getElementById('chat-input-btn').addEventListener('click', handleChatInput);
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleChatInput();  // Trigger send when Enter key is pressed
    }
});

// Function to handle chat input
async function handleChatInput() {
    const chatInput = document.getElementById('chat-input').value.trim();

    // Validate input
    if (chatInput === '') {
        alert('Please enter a message.');
        return;
    }

    // Display the user's message
    displayMessage('You', chatInput);
    document.getElementById('chat-input').value = '';

    // Check for keywords in the user's input
    const lowerCaseInput = chatInput.toLowerCase();
    
    let weatherData;
    let cityInput;

   




    const cityMatch = lowerCaseInput.match(/in\s+([a-zA-Z\s]+)/);
    if(!cityInput && !weatherData && !cityMatch)
        {
            displayMessage('Chatbot', "I only answer weather-related queries.");
                return;
        }
    if (cityMatch) {
        cityInput = cityMatch[1].trim(); // Capture the city name from the input
    } else {
        // If no city is mentioned, you can respond or exit here
        displayMessage('Chatbot', 'Please include a city in your message.');
        return;
    }

    if (lowerCaseInput.includes("weather")) {
        weatherData = await fetchWeather(cityInput);
        if (weatherData) {
            displayMessage('Chatbot', `Weather in ${cityInput}: Temperature: ${weatherData.temperature} °C, Humidity: ${weatherData.humidity}%, Weather: ${weatherData.description}, Wind Speed: ${weatherData.wind_speed} m/s`);
        } else {
            displayMessage('Chatbot', 'Sorry, I could not fetch the weather details.');
        }
    } else if (lowerCaseInput.includes("temperature")) {
        weatherData = await fetchWeather(cityInput);
        if (weatherData) {
            displayMessage('Chatbot', `Temperature in ${cityInput}: ${weatherData.temperature} °C`);
        } else {
            displayMessage('Chatbot', 'Sorry, I could not fetch the weather details.');
        }
    } else if (lowerCaseInput.includes("humidity")) {
        weatherData = await fetchWeather(cityInput);
        if (weatherData) {
            displayMessage('Chatbot', `Humidity in ${cityInput}: ${weatherData.humidity}%`);
        } else {
            displayMessage('Chatbot', 'Sorry, I could not fetch the weather details.');
        }
    } else if (lowerCaseInput.includes("wind speed")) {
        weatherData = await fetchWeather(cityInput);
        if (weatherData) {
            displayMessage('Chatbot', `Wind Speed in ${cityInput}: ${weatherData.wind_speed} m/s`);
        } else {
            displayMessage('Chatbot', 'Sorry, I could not fetch the weather details.');
        }
    } else {
        displayMessage('Chatbot', "I only answer weather-related queries.");
    }
}

// Fetch weather data from OpenWeather API
async function fetchWeather(city) {
    const apiKey = "bb6f73c83e240e481caa1541ecab14a0"; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return {
            temperature: data.main.temp,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            wind_speed: data.wind.speed,
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Function to display messages in the chat window
function displayMessage(sender, message) {
    const chatMessages = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);

    // Scroll to the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Forecast Table Logic
let forecastData = []; // Declare forecastData globally to be accessed by filters

document.getElementById('get-weather-btn').addEventListener('click', async () => {
    const cityInput = document.getElementById('city-input').value.trim();
    if (cityInput) {
        const data = await fetchForecast(cityInput);
        if (data) {
            forecastData = data; // Assign the fetched forecast data to the global variable
            renderForecastTable(forecastData);
        } else {
            alert('Could not fetch the weather data.');
        }
    } else {
        alert('Please enter a city name.');
    }
});

// Function to fetch the 5-day forecast data from OpenWeather API
async function fetchForecast(city) {
    const apiKey = "bb6f73c83e240e481caa1541ecab14a0"; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data.list; // This contains the weather forecast data
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        return null;
    }
}

// Function to render the fetched forecast data in the table
function renderForecastTable(forecastData) {
    const forecastBody = document.getElementById('forecast-body');
    forecastBody.innerHTML = ''; // Clear the table first

    // Render the first 5 forecast entries (one for each day)
    const dailyForecast = forecastData.filter((entry, index) => index % 8 === 0); // Get forecast every 24 hours
    dailyForecast.forEach(entry => {
        const date = new Date(entry.dt_txt); // Convert the timestamp to a readable date
        const row = document.createElement('tr');
        row.innerHTML = `<td>${date.toDateString()}</td><td>${entry.main.temp} °C</td>`;
        forecastBody.appendChild(row);
    });
}

// Forecast Data Placeholder
let currentPage = 0;
const rowsPerPage = 10;

function renderTable(data) {
    const forecastBody = document.getElementById('forecast-body');
    forecastBody.innerHTML = ''; // Clear previous entries

    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${new Date(entry.dt_txt).toDateString()}</td><td>${entry.main.temp} °C</td>`;
        forecastBody.appendChild(row);
    });

    document.getElementById('prev-btn').style.display = currentPage === 0 ? 'none' : 'inline';
    document.getElementById('next-btn').style.display = end >= data.length ? 'none' : 'inline';
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        renderTable(forecastData);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if ((currentPage + 1) * rowsPerPage < forecastData.length) {
        currentPage++;
        renderTable(forecastData);
    }
});

// Add filter buttons dynamically
function addFilterButtons() {
    const filterButtons = document.getElementById('filter-buttons');
    filterButtons.innerHTML = ''; // Clear existing buttons

    // Button to sort temperatures in ascending order
    const ascButton = document.createElement('button');
    ascButton.innerText = 'Sort Temperatures Ascending';
    ascButton.onclick = () => {
        const sortedData = [...forecastData].sort((a, b) => a.main.temp - b.main.temp);
        renderTable(sortedData);
    };
    filterButtons.appendChild(ascButton);

    // Button to filter out days without rain
    const rainButton = document.createElement('button');
    rainButton.innerText = 'Filter Rainy Days';
    rainButton.onclick = () => {
        const rainyDays = forecastData.filter(entry => entry.weather[0].main.toLowerCase() === 'rain');
        renderTable(rainyDays);
    };
    filterButtons.appendChild(rainButton);

    // Button to show the day with the highest temperature
    const highestTempButton = document.createElement('button');
    highestTempButton.innerText = 'Show Highest Temperature';
    highestTempButton.onclick = () => {
        const highest = forecastData.reduce((max, entry) => (entry.main.temp > max.main.temp ? entry : max), forecastData[0]);
        renderTable([highest]);
    };
    filterButtons.appendChild(highestTempButton);

    // Button to sort temperatures in descending order
    const descButton = document.createElement('button');
    descButton.innerText = 'Sort Temperatures Descending';
    descButton.onclick = () => {
        const sortedData = [...forecastData].sort((a, b) => b.main.temp - a.main.temp);
        renderTable(sortedData);
    };
    filterButtons.appendChild(descButton);
}

// Initial render
addFilterButtons();
