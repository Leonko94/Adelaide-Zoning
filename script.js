
let map = L.map('map').setView([-34.9285, 138.6007], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

let zoneLayer;

fetch('zones-simplified.geojson')
  .then(res => res.json())
  .then(data => {
    zoneLayer = L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const name = feature.properties.ZoneName || "Unknown zone";
        const code = feature.properties.ZoneCode || "";
        layer.bindPopup(`<strong>${name}</strong> (${code})`);
      }
    }).addTo(map);
  });

function applyFilter() {
  const zoneValue = document.getElementById('zoneFilter').value;
  if (!zoneLayer) return;

  zoneLayer.clearLayers();

  fetch('zones-simplified.geojson')
    .then(res => res.json())
    .then(data => {
      const filtered = {
        ...data,
        features: data.features.filter(f => {
          const code = f.properties.ZoneCode || "";
          return zoneValue === "" || code === zoneValue;
        })
      };
      zoneLayer.addData(filtered);
    });
}
