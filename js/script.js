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

// RNG stuff
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomCost(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// Randomize ride
function randomizeRides() {
  const rides = document.querySelectorAll(".riders");

  rides.forEach(ride => {
    const rateElement = ride.querySelector("p:nth-child(2)");
    const driversElement = ride.querySelector("p:nth-child(3)");

    // Driver range: 0–5
    const randomDrivers = getRandomInt(0, 5);

    if (driversElement) {
      driversElement.textContent = `Drivers: ${randomDrivers}`;
    }

    // Check drivers
    if (randomDrivers === 0) {
      rateElement.textContent = "Rate: $0.00";
    } else {
      // RNG price for the range
      const minCost = getRandomInt(10, 25);   // lower
      const maxCost = getRandomInt(minCost + 1, 30); // higher
      rateElement.textContent = `Rate: $${minCost} - $${maxCost}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", randomizeRides);