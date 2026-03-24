// -------------------------------------
// Fetch Water Temperature (USACE WTTO2)
// -------------------------------------
// -----------------------------------------------------
// REAL-TIME WATER TEMPERATURE FOR WTTO2 (USACE CSV FEED)
// -----------------------------------------------------
async function getWaterTemperature() {
  const display = document.getElementById("waterTemp");

  // 1. Try CSV endpoint (most likely to work)
  const csvUrl = "https://www.swt-wc.usace.army.mil/webdata/gagedata/WTTO2.csv";

  try {
    const response = await fetch(csvUrl, { mode: "cors" });

    if (!response.ok) {
      console.error("CSV fetch failed, status:", response.status);
      throw new Error("CSV request failed");
    }

    const text = await response.text();

    // Split lines
    const lines = text.trim().split("\n");
    const header = lines[0].split(",");

    const tempIndex = header.indexOf("WTR-TEMP");
    if (tempIndex === -1) {
      console.error("WTR-TEMP column not found. Header:", header);
      display.textContent = "No temperature column";
      return;
    }

    const lastLine = lines[lines.length - 1].split(",");
    const waterTemp = lastLine[tempIndex];

    if (!waterTemp || waterTemp === "---") {
      display.textContent = "No data available";
    } else {
      display.textContent = `${waterTemp} °F`;
    }

    return;

  } catch (err) {
    console.error("Error fetching USACE CSV:", err);
    display.textContent = "Error loading data";
  }
}
``



// -------------------------------------
// Fetch Air Temperature (OpenWeatherMap)
// -------------------------------------
async function getAirTemperature() {
  const lat = 36.13;
  const lon = -94.57;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=36.13&longitude=-94.57&current=temperature_2m&temperature_unit=fahrenheit`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.current || data.current.temperature_2m === undefined) {
      document.getElementById("airTemp").textContent = "No data available";
      console.error("Open-Meteo missing field:", data);
      return;
    }

    const temp = data.current.temperature_2m;
    document.getElementById("airTemp").textContent = `${temp} °C`;
  } catch (err) {
    document.getElementById("airTemp").textContent = "Error loading data";
    console.error("Open-Meteo fetch error:", err);
  }
}
``

// Auto-run both functions on page load
getWaterTemperature();
getAirTemperature();
