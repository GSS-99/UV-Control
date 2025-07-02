document.addEventListener('DOMContentLoaded', () => {
  const locationBtn = document.getElementById('location-btn');
  const mapContainer = document.getElementById('map');

  locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location:', latitude, longitude);

        // Update map image using OpenStreetMap static tile
        const mapImg = document.createElement('img');
        mapImg.src = `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&z=12&l=map&size=450,300&lang=en_US`;
        mapImg.alt = "Map of your location";
        mapImg.style.borderRadius = "8px";
        mapImg.style.width = "100%";

        mapContainer.innerHTML = '';
        mapContainer.appendChild(mapImg);

        // Next: Call UV and weather APIs here
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        alert('Location access is required to display UV forecast.');
      }
    );
  });
});
