
const map = L.map('map').setView([-34.9285, 138.6007], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

L.Control.geocoder({ defaultMarkGeocode: false })
  .on('markgeocode', function(e) {
    map.setView(e.geocode.center, 17);
    L.marker(e.geocode.center).addTo(map).bindPopup(e.geocode.name).openPopup();
  })
  .addTo(map);

let geojsonLayer;
let originalData;

fetch('zones.geojson')
  .then(res => res.json())
  .then(data => {
    originalData = data;
    renderLayer(data);
  });

function renderLayer(data) {
  if (geojsonLayer) map.removeLayer(geojsonLayer);
  geojsonLayer = L.geoJSON(data, {
    style: feature => ({ color: "#0077cc", weight: 1 }),
    onEachFeature: (feature, layer) => {
      const zone = feature.properties.name || feature.properties.value;
      const area = feature.properties.shape_Area;
      const frontage = estimateFrontage(feature.geometry);

      layer.bindPopup(
        `<strong>Zone:</strong> ${zone}<br>
         <strong>Area:</strong> ${area.toFixed(1)} m²<br>
         <strong>Frontage:</strong> ${frontage.toFixed(1)} m<br>
         <strong>Build Potential:</strong><br>` + calculateFeasibility(area, frontage)
      );
    }
  }).addTo(map);
}

function applyFilters() {
  const selectedZones = Array.from(document.getElementById('zoneFilter').selectedOptions).map(o => o.value);
  const minArea = parseFloat(document.getElementById('minArea').value);
  const minFrontage = parseFloat(document.getElementById('minFrontage').value);

  const filtered = originalData.features.filter(f => {
    const zone = f.properties.name || f.properties.value;
    const area = f.properties.shape_Area;
    const frontage = estimateFrontage(f.geometry);
    return selectedZones.includes(zone) && area >= minArea && frontage >= minFrontage;
  });

  renderLayer({ type: 'FeatureCollection', features: filtered });
}

function estimateFrontage(geometry) {
  const coords = geometry.coordinates[0];
  let minX = coords[0][0], maxX = coords[0][0];
  coords.forEach(c => {
    if (c[0] < minX) minX = c[0];
    if (c[0] > maxX) maxX = c[0];
  });
  return maxX - minX;
}

function calculateFeasibility(area, frontage) {
  const type = document.getElementById("dwellingType").value;
  const rules = {
    detached: { area: 300, frontage: 9 },
    semi: { area: 250, frontage: 8 },
    row: { area: 200, frontage: 6 },
    group: { area: 350, frontage: 10 }
  };
  const minArea = rules[type].area;
  const minFront = rules[type].frontage;
  const possible = Math.min(Math.floor(area / minArea), Math.floor(frontage / minFront));
  return possible > 0 ? `${possible} ${type} dwellings` : "Not suitable";
}
