// Hamburger menu
const hamburger = document.getElementById("hamburger");
const navMenu = document.querySelector("nav ul");
if (hamburger) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

// Utility RNG
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------- Index Page ----------------
if (document.getElementById("map") && document.getElementById("ridesContent")) {
  const map = L.map("map").setView([1.3521, 103.8198], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  let points = [];
  let markers = [];
  let routeLine;

  map.on("click", function (e) {
    if (points.length >= 2) {
      points = [];
      markers.forEach((m) => map.removeLayer(m));
      markers = [];
      if (routeLine) map.removeLayer(routeLine);
      document.getElementById("ridesContent").classList.add("hidden");
    }

    points.push(e.latlng);
    const markerLabel = points.length === 1 ? "Start" : "Destination";
    const marker = L.marker(e.latlng).addTo(map).bindPopup(markerLabel).openPopup();
    markers.push(marker);

    if (points.length === 2) {
      routeLine = L.polyline(points, { color: "blue" }).addTo(map);
      map.fitBounds(routeLine.getBounds());
      document.getElementById("ridesContent").classList.remove("hidden");
    }
  });

  // Randomize rides
  function randomizeRides() {
    const rides = document.querySelectorAll(".riders");
    rides.forEach((ride) => {
      const rateElement = ride.querySelector("p:nth-child(3)");
      const driversElement = ride.querySelector("p:nth-child(2)");

      const driverCount = getRandomInt(0, 5);
      if (driversElement) driversElement.textContent = `Drivers: ${driverCount}`;

      if (rateElement) {
        if (driverCount === 0) {
          rateElement.textContent = "Rate: $0.00";
        } else {
          const minCost = getRandomInt(10, 20);
          const maxCost = getRandomInt(minCost + 1, 30);
          rateElement.textContent = `Rate: $${minCost} - $${maxCost}`;
        }
      }
    });
  }
  randomizeRides();

  // Ride card click → ride.html
  document.querySelectorAll(".riders").forEach((ride, index) => {
    ride.addEventListener("click", () => {
      if (points.length === 2) {
        const start = points[0];
        const dest = points[1];
        const driversText = ride.querySelector("p:nth-child(2)").textContent;
        const rateText = ride.querySelector("p:nth-child(3)").textContent;
        const driverCount = parseInt(driversText.split(":")[1].trim());
        const [minRate, maxRate] = rateText
          .split("$")[1]
          .split(" - ")
          .map(Number);

        window.location.href = `ride.html?id=${index}&startLat=${start.lat}&startLng=${start.lng}&destLat=${dest.lat}&destLng=${dest.lng}&driverCount=${driverCount}&minRate=${minRate}&maxRate=${maxRate}`;
      }
    });
  });
}

// ---------------- Ride Page ----------------
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cars") && document.getElementById("rideMap")) {
    const params = new URLSearchParams(window.location.search);
    const startLat = parseFloat(params.get("startLat")) || 1.3521;
    const startLng = parseFloat(params.get("startLng")) || 103.8198;
    const destLat = parseFloat(params.get("destLat")) || 1.3521;
    const destLng = parseFloat(params.get("destLng")) || 103.8198;
    const driverCount = parseInt(params.get("driverCount")) || 0;
    const minRate = parseFloat(params.get("minRate")) || 10;
    const maxRate = parseFloat(params.get("maxRate")) || 30;

    const rideMap = L.map("rideMap").setView([startLat, startLng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(rideMap);

    L.marker([startLat, startLng]).addTo(rideMap).bindPopup("Start").openPopup();
    L.marker([destLat, destLng]).addTo(rideMap).bindPopup("Destination");
    L.polyline([[startLat, startLng], [destLat, destLng]], { color: "blue" }).addTo(rideMap);

    const carImages = [
      "https://img.icons8.com/color/48/car.png",
      "https://img.icons8.com/color/48/taxi.png",
      "https://img.icons8.com/color/48/suv.png",
    ];

    // Generate drivers with random price and ETA
    let drivers = [];
    for (let i = 0; i < driverCount; i++) {
      drivers.push({
        i: i + 1,
        eta: getRandomInt(2, 12),
        price: (Math.random() * (maxRate - minRate) + minRate).toFixed(2),
        lat: startLat + (Math.random() - 0.5) * 0.01,
        lng: startLng + (Math.random() - 0.5) * 0.01,
      });
    }

    // Sort by ETA
    drivers.sort((a, b) => a.eta - b.eta);

    const carsDiv = document.getElementById("cars");

    drivers.forEach((driver) => {
      L.marker([driver.lat, driver.lng])
        .addTo(rideMap)
        .bindPopup(`Driver ${driver.i} - $${driver.price} - ETA: ${driver.eta} mins`);

      const car = document.createElement("div");
      car.classList.add("riders");
      car.innerHTML = `<p>Driver ${driver.i}</p><p>Price: $${driver.price}</p><p>ETA: ${driver.eta} mins</p>`;
      carsDiv.appendChild(car);

      car.addEventListener("click", () => {
        window.location.href = `accepted.html?startLat=${startLat}&startLng=${startLng}&destLat=${destLat}&destLng=${destLng}&driver=${driver.i}&eta=${driver.eta}`;
      });
    });
  }
});

// ---------------- Accepted Page ----------------
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("acceptedMap")) {
    const params = new URLSearchParams(window.location.search);
    const startLat = parseFloat(params.get("startLat"));
    const startLng = parseFloat(params.get("startLng"));
    const destLat = parseFloat(params.get("destLat"));
    const destLng = parseFloat(params.get("destLng"));
    const driverChosen = params.get("driver");
    const eta = parseInt(params.get("eta")) || 5;

    const acceptedMap = L.map("acceptedMap").setView([startLat, startLng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(acceptedMap);

    L.marker([startLat, startLng]).addTo(acceptedMap).bindPopup("Start").openPopup();
    L.marker([destLat, destLng]).addTo(acceptedMap).bindPopup("Destination");
    L.polyline([[startLat, startLng], [destLat, destLng]], { color: "blue" }).addTo(acceptedMap);

    const driverText = document.getElementById("driverChosen");
    if (driverText) driverText.textContent = `Driver ${driverChosen} is on the way!`;

    let countdown = eta * 60;
    const timerEl = document.getElementById("timer");
    const interval = setInterval(() => {
      if (countdown <= 0) {
        clearInterval(interval);
        timerEl.textContent = "Driver has arrived!";
      } else {
        const mins = Math.floor(countdown / 60);
        const secs = countdown % 60;
        timerEl.textContent = `${mins}:${secs.toString().padStart(2, "0")} remaining`;
        countdown--;
      }
    }, 1000);
  }
});
