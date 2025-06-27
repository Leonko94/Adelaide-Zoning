var map = L.map('map').setView([-34.9285, 138.6007], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Load zoning GeoJSON
fetch('zones.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#ff7800",
        weight: 2,
        opacity: 0.65
      },
      onEachFeature: function (feature, layer) {
        const zone = feature.properties.zone || feature.properties.ZONE_NAME;
        layer.bindPopup(`<b>Zone:</b> ${zone}`);
      }
    }).addTo(map);
  });
