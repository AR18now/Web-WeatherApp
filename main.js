// Fetch Weather Data
async function fetchWeather(city, unit = 'metric') {
    const apiKey = "bb6f73c83e240e481caa1541ecab14a0"; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        document.getElementById('city-name').innerText = data.name;
        document.getElementById('temperature').innerText = data.main.temp;
        document.getElementById('humidity').innerText = data.main.humidity;
        document.getElementById('wind-speed').innerText = data.wind.speed;
        document.getElementById('weather-description').innerText = data.weather[0].description;
        document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

        document.getElementById('weather-icon').classList.add('fade-in');
        setTimeout(() => {
            document.getElementById('weather-icon').style.opacity = 1;
        }, 50);

        // Load Forecast Data
        await fetchForecast(city, unit);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert("City not found. Please try again.");
    }
}

// Fetch 5-day Forecast
async function fetchForecast(city, unit = 'metric') {
    const apiKey = "bb6f73c83e240e481caa1541ecab14a0"; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const forecastCards = document.getElementById('forecast-cards');
        forecastCards.innerHTML = ''; // Clear previous cards

        data.list.forEach((item, index) => {
            if (index % 8 === 0) { // Get one forecast every 24 hours
                const card = document.createElement('div');
                card.className = 'forecast-card';
                card.innerHTML = `
                    <h3>${new Date(item.dt * 1000).toLocaleDateString()}</h3>
                    <p>Temp: ${item.main.temp} °C</p>
                    <p>Humidity: ${item.main.humidity}%</p>
                    <p>${item.weather[0].description}</p>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather Icon">
                `;
                forecastCards.appendChild(card);
            }
        });
        loadCharts(data.list, unit);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

// Load Charts
function loadCharts(forecastList, unit) {
    const labels = forecastList.filter((_, index) => index % 8 === 0).map(item => new Date(item.dt * 1000).toLocaleDateString());
    const temperatures = forecastList.filter((_, index) => index % 8 === 0).map(item => item.main.temp);
    const weatherConditions = {};

    forecastList.forEach(item => {
        const condition = item.weather[0].description;
        weatherConditions[condition] = (weatherConditions[condition] || 0) + 1;
    });

    const weatherConditionLabels = Object.keys(weatherConditions);
    const weatherConditionData = Object.values(weatherConditions);

    // Bar Chart for Temperatures
    const tempBarCtx = document.getElementById('temperatureBarChart').getContext('2d');
    new Chart(tempBarCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw} °C`
                    }
                }
            }
        }
    });

    // Doughnut Chart for Weather Conditions
    const doughnutCtx = document.getElementById('weatherConditionDoughnutChart').getContext('2d');
    new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: weatherConditionLabels,
            datasets: [{
                label: 'Weather Conditions',
                data: weatherConditionData,
                backgroundColor: weatherConditionLabels.map((_, index) => `hsl(${index * 50}, 100%, 50%)`),
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
            }
        }
    });

    // Line Chart for Temperature Changes
    const tempLineCtx = document.getElementById('temperatureLineChart').getContext('2d');
    new Chart(tempLineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                borderColor: 'rgba(33, 150, 243, 1)',
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw} °C`
                    }
                }
            }
        }
    });
}

// Event Listeners
document.getElementById('get-weather-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    const unit = document.querySelector('.unit-btn.active').innerText === '°C' ? 'metric' : 'imperial';
    if (city) {
        document.getElementById('loading-spinner').style.display = 'block';
        fetchWeather(city, unit);
        document.getElementById('loading-spinner').style.display = 'none';
    } else {
        alert('Please enter a city name.');
    }
});

// Toggle Temperature Unit
document.getElementById('celsius-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('fahrenheit-btn').classList.remove('active');
});

document.getElementById('fahrenheit-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('celsius-btn').classList.remove('active');
});
