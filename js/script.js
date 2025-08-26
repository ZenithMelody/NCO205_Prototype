const hamburger = document.getElementById("hamburger");
const navMenu = document.querySelector("nav ul");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// Initialize map (Singapore)
const map = L.map('map').setView([1.3521, 103.8198], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

let points = [];
let markers = [];
let routeLine;

map.on("click", function(e) {
  if (points.length >= 2) {
    // Reset if two points
    points = [];
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    if (routeLine) map.removeLayer(routeLine);
    document.getElementById("ridesContent").classList.add("hidden"); // hide rides again
  }

  // Add point
  points.push(e.latlng);

  // Add marker
  let markerLabel = points.length === 1 ? "Start" : "Destination";
  let marker = L.marker(e.latlng).addTo(map).bindPopup(markerLabel).openPopup();
  markers.push(marker);

  // Draw line + show
  if (points.length === 2) {
    routeLine = L.polyline(points, { color: "blue" }).addTo(map);
    map.fitBounds(routeLine.getBounds());
    document.getElementById("ridesContent").classList.remove("hidden");
  }
});
