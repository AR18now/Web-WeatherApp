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

    // Check if the input contains "weather"
    if (!chatInput.toLowerCase().includes("weather")) {
        displayMessage('Chatbot', "I can only answer weather-related queries.");
        return;
    }

    // If it includes "weather," ask for the city
    displayMessage('Chatbot', "For which city do you want to know the weather?");
    const cityInput = await getCityInput(); // Await user input for the city

    if (!cityInput) {
        displayMessage('Chatbot', 'You did not provide a city.');
        return;
    }

    // Fetch weather data from OpenWeather API
    const weatherData = await fetchWeather(cityInput);
    if (weatherData) {
        displayMessage('Chatbot', `Weather in ${cityInput}: ${weatherData}`);
    } else {
        displayMessage('Chatbot', 'Sorry, I could not fetch the weather details.');
    }
}

// Function to get city input from the user
function getCityInput() {
    return new Promise((resolve) => {
        const cityInput = prompt("Please enter the city name:");
        resolve(cityInput ? cityInput.trim() : null);
    });
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
        return `Temperature: ${data.main.temp} °C, Humidity: ${data.main.humidity}%, Weather: ${data.weather[0].description}`;
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
document.getElementById('get-weather-btn').addEventListener('click', async () => {
    const cityInput = document.getElementById('city-input').value.trim();
    if (cityInput) {
        const forecastData = await fetchForecast(cityInput);
        if (forecastData) {
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
const forecastData = [
    { day: 'Day 1', temperature: 22, weather: { main: 'Clear' } },
    { day: 'Day 2', temperature: 24, weather: { main: 'Rain' } },
    { day: 'Day 3', temperature: 23, weather: { main: 'Clear' } },
    { day: 'Day 4', temperature: 25, weather: { main: 'Rain' } },
    { day: 'Day 5', temperature: 26, weather: { main: 'Clear' } },
    { day: 'Day 6', temperature: 27, weather: { main: 'Rain' } },
    { day: 'Day 7', temperature: 28, weather: { main: 'Clear' } },
    { day: 'Day 8', temperature: 29, weather: { main: 'Clear' } },
    { day: 'Day 9', temperature: 30, weather: { main: 'Rain' } },
    { day: 'Day 10', temperature: 31, weather: { main: 'Clear' } },
    { day: 'Day 11', temperature: 32, weather: { main: 'Rain' } },
    { day: 'Day 12', temperature: 33, weather: { main: 'Clear' } },
];

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
        row.innerHTML = `<td>${entry.day}</td><td>${entry.temperature} °C</td>`;
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
        const sortedData = [...forecastData].sort((a, b) => a.temperature - b.temperature);
        renderTable(sortedData);
    };
    filterButtons.appendChild(ascButton);

    // Button to filter out days without rain
    const rainButton = document.createElement('button');
    rainButton.innerText = 'Filter Rainy Days';
    rainButton.onclick = () => {
        const rainyDays = forecastData.filter(entry => entry.weather.main.toLowerCase() === 'rain');
        renderTable(rainyDays);
    };
    filterButtons.appendChild(rainButton);

    // Button to show the day with the highest temperature
    const highestTempButton = document.createElement('button');
    highestTempButton.innerText = 'Show Highest Temperature';
    highestTempButton.onclick = () => {
        const highest = forecastData.reduce((max, entry) => (entry.temperature > max.temperature ? entry : max), forecastData[0]);
        renderTable([highest]);
    };
    filterButtons.appendChild(highestTempButton);

    // Button to sort temperatures in descending order
    const descButton = document.createElement('button');
    descButton.innerText = 'Sort Temperatures Descending';
    descButton.onclick = () => {
        const sortedData = [...forecastData].sort((a, b) => b.temperature - a.temperature);
        renderTable(sortedData);
    };
    filterButtons.appendChild(descButton);
}

// Initial render
renderTable(forecastData);
addFilterButtons();
