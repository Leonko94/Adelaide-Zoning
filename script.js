let map = L.map('map').setView([-34.9285, 138.6007], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

L.Control.geocoder().addTo(map);

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

function onEachFeature(feature, layer) {
  const p = feature.properties;
  const area = p.Area || "N/A";
  const frontage = p.Frontage || "N/A";
  const zone = p.Zone + " (" + p.Zone_Code + ")";
  const feas = getFeasibility(p);
  layer.bindPopup(\`\${p.Suburb}<br/>\${zone}<br/>Area: \${area}m²<br/>Frontage: \${frontage}m<br/>\${feas}\`);
}

function applyFilter() {
  const zoneVal = document.getElementById('zoneSelect').value;
  const suburbVal = document.getElementById('suburbSelect').value;
  const minArea = parseFloat(document.getElementById('minArea').value) || 0;
  const minFrontage = parseFloat(document.getElementById('minFrontage').value) || 0;

  const filtered = allFeatures.filter(f => {
    const p = f.properties;
    const matchZone = !zoneVal || (p.Zone + " (" + p.Zone_Code + ")") === zoneVal;
    const matchSuburb = !suburbVal || p.Suburb === suburbVal;
    const matchArea = !p.Area || parseFloat(p.Area) >= minArea;
    const matchFront = !p.Frontage || parseFloat(p.Frontage) >= minFrontage;
    return matchZone && matchSuburb && matchArea && matchFront;
  });

  if (geojsonLayer) geojsonLayer.remove();
  geojsonLayer = L.geoJSON(filtered, {
    onEachFeature: onEachFeature
  }).addTo(map);
}

function getFeasibility(p) {
  let result = "";
  const a = parseFloat(p.Area);
  const f = parseFloat(p.Frontage);
  if (a >= 600 && f >= 18) result = "✓ 2 Detached Homes";
  else if (a >= 500 && f >= 15) result = "✓ 2 Semi-Detached";
  else if (a >= 450 && f >= 14) result = "✓ 2 Row Dwellings";
  else result = "Likely 1 dwelling";
  return result;
}

function exportCSV() {
  const rows = [["Suburb", "Zone", "Area", "Frontage", "Feasibility"]];
  geojsonLayer.eachLayer(layer => {
    const p = layer.feature.properties;
    rows.push([p.Suburb, p.Zone + " (" + p.Zone_Code + ")", p.Area, p.Frontage, getFeasibility(p)]);
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "filtered_parcels.csv";
  a.click();
}