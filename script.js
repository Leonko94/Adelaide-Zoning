
const map = L.map('map').setView([-34.9285, 138.6007], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

let geojsonLayer;

fetch('zones.geojson')
  .then(res => res.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      style: feature => ({ color: "#ff7800", weight: 1 }),
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
  });

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
