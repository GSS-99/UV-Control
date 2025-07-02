document.addEventListener('DOMContentLoaded', () => {
  const locationBtn = document.getElementById('location-btn');
  const mapContainer = document.getElementById('map');
  const forecastContainer = document.querySelector('.forecast-container');

  locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // Setup map container
      mapContainer.innerHTML = '';
      const mapDiv = document.createElement('div');
      mapDiv.id = "leaflet-map";
      mapDiv.style.width = "100%";
      mapDiv.style.height = "300px";
      mapDiv.style.borderRadius = "10px";
      mapContainer.appendChild(mapDiv);

      // Initialize Leaflet map
      const map = L.map('leaflet-map').setView([latitude, longitude], 11);

      // Add OpenStreetMap tile layer (free, no key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add marker for user location
      L.marker([latitude, longitude]).addTo(map).bindPopup('You are here').openPopup();

      // Fetch weather data from Open-Meteo
      const weatherData = await fetchWeatherData(latitude, longitude);
      if (weatherData) {
        const daily = weatherData.daily;
        const uvIndex = daily.uv_index_max[0];
        const tempMax = daily.temperature_2m_max[0];
        const tempMin = daily.temperature_2m_min[0];

        const riskLevel = getRiskLevel(uvIndex);
        const tip = getTip(uvIndex);

        // Today’s summary
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
                <span class="value">${tempMin.toFixed(1)}°C - ${tempMax.toFixed(1)}°C</span>
              </div>
            </div>
            <div class="tip-banner">${tip}</div>
          </div>
          <div class="forecast-list">
            <h3>Next 6 Days</h3>
            <div class="daily-forecast">
              ${daily.time.slice(1, 7).map((dateStr, i) => {
                const date = new Date(dateStr);
                const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
                const uv = daily.uv_index_max[i+1];
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
    }, (err) => {
      console.error('Location error:', err.message);
      alert('Location access is required to display UV forecast.');
    });
  });

  async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      alert('Error fetching weather data');
      return null;
    }
  }

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
});
