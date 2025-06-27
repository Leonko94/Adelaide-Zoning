let map = L.map('map').setView([-34.9285, 138.6007], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

let geojsonLayer;
let allFeatures = [];

fetch("zones.json")
  .then(response => response.json())
  .then(data => {
    allFeatures = data.features;
    populateZoneSelect(allFeatures);
    populateSuburbSelect(allFeatures);
    geojsonLayer = L.geoJSON(allFeatures, {
      onEachFeature: onEachFeature
    }).addTo(map);
  });

function onEachFeature(feature, layer) {
  let props = feature.properties;
  layer.bindPopup(\`<strong>\${props.Zone}</strong><br>Suburb: \${props.Suburb}<br>Area: \${props.Area} m²<br>Frontage: \${props.Frontage} m\`);
}

function populateZoneSelect(features) {
  const zones = [...new Set(features.map(f => f.properties.Zone + " (" + f.properties.Zone_Code + ")"))];
  const select = document.getElementById('zoneSelect');
  zones.sort().forEach(z => {
    const opt = document.createElement('option');
    opt.value = z;
    opt.innerText = z;
    select.appendChild(opt);
  });
}

function populateSuburbSelect(features) {
  const suburbs = [...new Set(features.map(f => f.properties.Suburb))];
  const select = document.getElementById('suburbSelect');
  suburbs.sort().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.innerText = s;
    select.appendChild(opt);
  });
}

function applyFilter() {
  const zone = document.getElementById('zoneSelect').value;
  const suburb = document.getElementById('suburbSelect').value;
  const minArea = parseFloat(document.getElementById('minArea').value) || 0;
  const minFront = parseFloat(document.getElementById('minFrontage').value) || 0;

  if (geojsonLayer) map.removeLayer(geojsonLayer);

  const filtered = allFeatures.filter(f => {
    const p = f.properties;
    return (!zone || (p.Zone + " (" + p.Zone_Code + ")") === zone) &&
           (!suburb || p.Suburb === suburb) &&
           (!minArea || p.Area >= minArea) &&
           (!minFront || p.Frontage >= minFront);
  });

  geojsonLayer = L.geoJSON(filtered, {
    onEachFeature: onEachFeature
  }).addTo(map);
}

function exportCSV() {
  const rows = [["Zone", "Zone_Code", "Suburb", "Area", "Frontage"]];
  geojsonLayer.eachLayer(layer => {
    const p = layer.feature.properties;
    rows.push([p.Zone, p.Zone_Code, p.Suburb, p.Area, p.Frontage]);
  });

  let csv = rows.map(r => r.join(",")).join("\n");
  let blob = new Blob([csv], { type: "text/csv" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "filtered_zones.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
