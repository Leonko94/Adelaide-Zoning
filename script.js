
let map = L.map('map').setView([-34.9285, 138.6007], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

let geojsonLayer;
let originalData;

fetch('zones.geojson')
  .then(res => res.json())
  .then(data => {
    originalData = data;
    geojsonLayer = L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const name = feature.properties.ZoneName || "Unknown";
        const code = feature.properties.ZoneCode || "";
        layer.bindPopup(`<strong>${name}</strong> (${code})`);
      }
    }).addTo(map);
  });

document.getElementById("filterButton").addEventListener("click", () => {
  const selected = document.getElementById("zoneFilter").value;

  if (geojsonLayer) {
    geojsonLayer.clearLayers();
    const filtered = {
      type: "FeatureCollection",
      features: originalData.features.filter(f =>
        !selected || f.properties.ZoneCode === selected
      )
    };
    geojsonLayer.addData(filtered);
  }
});
