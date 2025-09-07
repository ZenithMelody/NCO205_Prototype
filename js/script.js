// ---------------- Hamburger Menu ----------------
const hamburger = document.getElementById("hamburger");
const navMenu = document.querySelector("nav ul");
if (hamburger) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

// ---------------- Utility RNG ----------------
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
      const driversElement = ride.querySelector("p:nth-child(2)");
      const rateElement = ride.querySelector("p:nth-child(3)");

      const driverCount = getRandomInt(1, 5); // 1–5 drivers
      driversElement.textContent = `Drivers: ${driverCount}`;

      // Price range
      const prices = [];
      for (let i = 0; i < driverCount; i++) {
        prices.push((Math.random() * 20 + 10).toFixed(2)); // $10–30
      }
      ride.dataset.prices = JSON.stringify(prices);

      // Show overall range
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      rateElement.textContent = driverCount > 1 ? `Rate: $${minPrice} - $${maxPrice}` : `Rate: $${prices[0]}`;
    });
  }
  randomizeRides();

  // Ride card click → ride.html
  document.querySelectorAll(".riders").forEach((ride, index) => {
    ride.addEventListener("click", () => {
      if (points.length === 2) {
        const start = points[0];
        const dest = points[1];
        const prices = ride.dataset.prices;
        window.location.href = `ride.html?id=${index}&startLat=${start.lat}&startLng=${start.lng}&destLat=${dest.lat}&destLng=${dest.lng}&prices=${prices}`;
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
    const prices = JSON.parse(params.get("prices") || "[]");

    const rideMap = L.map("rideMap").setView([startLat, startLng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(rideMap);

    // Start & Destination
    L.marker([startLat, startLng]).addTo(rideMap).bindPopup("Start").openPopup();
    L.marker([destLat, destLng]).addTo(rideMap).bindPopup("Destination");
    L.polyline([[startLat, startLng], [destLat, destLng]], { color: "blue" }).addTo(rideMap);

    // Prepare drivers
    let drivers = prices.map((p) => ({
      price: parseFloat(p),
      eta: getRandomInt(2, 12),
    }));

    // Custom car icon
    const carIcon = L.icon({
      iconUrl: "https://img.icons8.com/color/48/car.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    // Place random driver markers (static)
    drivers.forEach((driver, i) => {
      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLng = (Math.random() - 0.5) * 0.01;
      L.marker([startLat + offsetLat, startLng + offsetLng], { icon: carIcon })
        .addTo(rideMap)
        .bindPopup(`Driver ${i + 1} - $${driver.price} - ETA: ${driver.eta} mins`);
    });

    // Display car options
    const carsDiv = document.getElementById("cars");
    const carImages = [
      "https://img.icons8.com/color/48/car.png",
      "https://img.icons8.com/color/48/taxi.png",
      "https://img.icons8.com/color/48/suv.png",
    ];

    function renderDrivers(sortBy = "time") {
      if (sortBy === "price") {
        drivers.sort((a, b) => a.price - b.price);
      } else {
        drivers.sort((a, b) => a.eta - b.eta);
      }

      carsDiv.innerHTML = "";

      drivers.forEach((driver, i) => {
        const carImg = carImages[getRandomInt(0, carImages.length - 1)];
        const car = document.createElement("div");
        car.classList.add("car-card");
        car.innerHTML = `
          <img src="${carImg}" alt="car">
          <p>Driver ${i + 1} - $${driver.price} - ETA: ${driver.eta} mins</p>
        `;
        carsDiv.appendChild(car);

        car.addEventListener("click", () => {
          window.location.href = `accepted.html?startLat=${startLat}&startLng=${startLng}&destLat=${destLat}&destLng=${destLng}&driver=${i + 1}&eta=${driver.eta}`;
        });
      });
    }

    // Initial render (by time)
    renderDrivers();

    // Listen for sort changes
    const sortBySelect = document.getElementById("sortBy");
    if (sortBySelect) {
      sortBySelect.addEventListener("change", (e) => {
        renderDrivers(e.target.value);
      });
    }
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
    let countdown = parseInt(params.get("eta")) * 60 || 300; // in seconds

    const acceptedMap = L.map("acceptedMap").setView([startLat, startLng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(acceptedMap);

    // Start & Destination markers
    L.marker([startLat, startLng]).addTo(acceptedMap).bindPopup("Start").openPopup();
    L.marker([destLat, destLng]).addTo(acceptedMap).bindPopup("Destination");
    L.polyline([[startLat, startLng], [destLat, destLng]], { color: "blue" }).addTo(acceptedMap);

    // Driver icon
    const carIcon = L.icon({
      iconUrl: "https://img.icons8.com/color/48/car.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    L.marker([startLat, startLng], { icon: carIcon }).addTo(acceptedMap)
      .bindPopup(`Driver ${driverChosen} is coming!`);

    // Countdown timer
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
