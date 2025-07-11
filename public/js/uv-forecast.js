document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map');
  const forecastContainer = document.querySelector('.forecast-container');
  const manualLocationBtn = document.getElementById('manual-location-btn');
  let userManuallyDenied = false;

  const cachedLocation = localStorage.getItem('userLocation');

  // --- Create Consent Modal ---
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <p>🌍 <strong>UV Control</strong> needs your location to display the UV forecast in your area. Your data is not stored.</p>
      <button id="allow-location">Allow</button>
      <button id="deny-location">Deny</button>
    </div>
  `;

  // --- Inject Modal Styles ---
  const style = document.createElement('style');
  style.innerHTML = `
    .modal {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex;
      align-items: center; justify-content: center;
      z-index: 9999;
    }
    .modal-content {
      background: #fff; padding: 2rem;
      border-radius: 8px; text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .modal-content button {
      margin: 0.5rem; padding: 0.5rem 1.5rem;
      border: none; border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }
    #allow-location { background-color: #008000; color: white; }
    #deny-location { background-color: #bbb; color: black; }
  `;
  document.head.appendChild(style);

  // --- If location is cached, skip modal and load forecast ---
  if (cachedLocation) {
  const { latitude, longitude } = JSON.parse(cachedLocation);
  manualLocationBtn.style.display = 'none'; // hide if location already known
  loadMapAndForecast(latitude, longitude);
}
 else {
    document.body.appendChild(modal);
  }

  // --- Modal Button Handlers ---
  document.addEventListener('click', (e) => {
    if (e.target.id === 'allow-location') {
      modal.remove();
      getUserLocation();
    }
    if (e.target.id === 'deny-location') {
      modal.remove();
      userManuallyDenied = true;
      alert('Location access denied. Unable to display personalized UV data.');
      manualLocationBtn.style.display = 'inline-block';
    }
  });

  // --- Manual Retry Button ---
  manualLocationBtn.addEventListener('click', () => {
    localStorage.removeItem('userLocation');
    getUserLocation();
  });

  // --- Get Location and Cache It ---
  async function getUserLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  try {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
        manualLocationBtn.style.display = 'none';
        loadMapAndForecast(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);

        if (err.code === err.PERMISSION_DENIED) {
          alert('Location access was denied. Please enable it in your browser settings if you want personalized UV data.');
        } else {
          alert('Could not get your location. You can try again or enter it manually.');
        }

        manualLocationBtn.style.display = 'inline-block';
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );
  } catch (error) {
    console.error('Unexpected location error:', error);
    alert('An unexpected error occurred while getting your location.');
    manualLocationBtn.style.display = 'inline-block';
  }
}

  // --- Load Map and Forecast ---
  async function loadMapAndForecast(latitude, longitude) {
    mapContainer.innerHTML = '';
    const mapDiv = document.createElement('div');
    mapDiv.id = "leaflet-map";
    mapDiv.style.width = "100%";
    mapDiv.style.height = "300px";
    mapDiv.style.borderRadius = "10px";
    mapContainer.appendChild(mapDiv);

    const map = L.map('leaflet-map', {
      center: [latitude, longitude],
      zoom: 11,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      touchZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([latitude, longitude]).addTo(map).bindPopup('You are here').openPopup();

    const weatherData = await fetchWeatherData(latitude, longitude);
    if (weatherData) {
      const daily = weatherData.daily;
      const uvIndex = daily.uv_index_max[0];
      const tempMax = daily.temperature_2m_max[0];
      const tempMin = daily.temperature_2m_min[0];
      const riskLevel = getRiskLevel(uvIndex);
      const tip = getTip(uvIndex);

      forecastContainer.innerHTML = `
        <div class="today-forecast">
          <h2>Today's UV Forecast</h2>
          <div class="forecast-details">
            <div class="forecast-metric">
              <span class="label">UV Index:</span>
              <span class="value">${uvIndex.toFixed(1)}</span>
              <span class="badge ${riskLevel.class}">${riskLevel.text}</span>
            </div>
            <div class="forecast-metric">
              <span class="label">Temperature:</span>
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
              const uv = daily.uv_index_max[i + 1];
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
  }

  // --- API + Utility Functions ---
  async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      return await res.json();
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
    return "High risk! Seek shade and protect your skin.";
  }
});