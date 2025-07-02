document.addEventListener('DOMContentLoaded', () => {
  const locationBtn = document.getElementById('location-btn');
  const mapContainer = document.getElementById('map');
  const API_KEY = window.OPENWEATHERMAP_API_KEY;

  locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
    
      // Replace static image with a Leaflet map
     const mapDiv = document.createElement('div');
      mapDiv.id = "leaflet-map";
      mapDiv.style.width = "100%";
      mapDiv.style.height = "300px";
      mapDiv.style.borderRadius = "10px";

      const mapContainer = document.getElementById('map');
      mapContainer.innerHTML = '';
      mapContainer.appendChild(mapDiv);

      // Initialize Leaflet map
      const map = L.map('leaflet-map').setView([latitude, longitude], 11);
      const forecastContainer = document.querySelector('.forecast-container');
      const weatherData = await fetchWeatherData(latitude, longitude);
      if (weatherData) {
        // Today’s summary
        const today = weatherData.current;
        const daily = weatherData.daily;

        const uvIndex = today.uvi;
        const temperature = today.temp;
        const riskLevel = getRiskLevel(uvIndex);
        const tip = getTip(uvIndex);

        forecastContainer.innerHTML = `
        <div class="today-forecast">
         <h2>Today's UV Forecast</h2>
          <div class="forecast-details">
            <div class="forecast-metric">
              <span class="label">UV Index</span>
              <span class="value">${uvIndex.toFixed(1)}</span>
              <span class="badge ${riskLevel.class}">${riskLevel.text}</span>
            </div>
            <div class="forecast-metric">
             <span class="label">Temperature</span>
             <span class="value">${temperature} °C</span>
            </div>
          </div>
          <div class="tip-banner">${tip}</div>
        </div>
        <div class="forecast-list">
          <h3>Next 6 Days</h3>
            <div class="daily-forecast">
              ${daily.slice(1, 7).map(day => {
                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
                const uv = day.uvi;
                const risk = getRiskLevel(uv);
                return `
                <div class="day">
                  <span class="day-label">${dayName}</span>
                  <span class="uv-index">${uv.toFixed(1)}</span>
                  <span class="badge ${risk.class}">${risk.text}</span>
                </div>`;
              }).join('')}
            </div>
        </div>`;
      }

      // Helper functions to classify risk and tips
      function getRiskLevel(uv) {
        if (uv <= 2) return { class: 'risk-low', text: 'Low' };
        if (uv <= 5) return { class: 'risk-medium', text: 'Moderate' };
        if (uv <= 7) return { class: 'risk-high', text: 'High' };
        return { class: 'risk-very-high', text: 'Very High' };
      }

      function getTip(uv) {
        if (uv <= 2) return "Low risk. Enjoy safely.";
        if (uv <= 5) return "Wear sunglasses and SPF 30.";
        if (uv <= 7) return "Avoid noon sun. Use SPF 50.";
        return "High risk! Seek shade and protect skin.";
      }

      
      // Base tile layer: OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      // Add marker for user location
      L.marker([latitude, longitude]).addTo(map).bindPopup('You are here').openPopup();
      
      // UV index overlay
        const uvLayer = L.tileLayer(`https://tile.openweathermap.org/map/uvi_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
          attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
        });
      
      // Add the UV overlay by default
        uvLayer.addTo(map);  
      },(err) => {
        console.error('Location error:', err.message);
        alert('Location access is required to display UV forecast.');
      }
    );
  });

  async function fetchWeatherData(lat, lon) {
  const API_KEY = '07772ae9f41729a19b40054fa683c64a';
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    const data = await res.json();
    return data; // contains current and daily forecasts
  } catch (err) {
    console.error(err);
    alert('Error fetching weather data');
    return null;
  }
}

});
