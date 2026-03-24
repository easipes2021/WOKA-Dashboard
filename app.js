// -------------------------------------
// Fetch Water Temperature (USACE WTTO2)
// -------------------------------------
async function getWaterTemperature() {
  try {
    const url = "https://www.swt-wc.usace.army.mil/webdata/json/WTTO2.json";
    const res = await fetch(url);
    const data = await res.json();

    // USACE WTTO2 JSON data ends with latest hour entry
    const latest = data.WTTO2[data.WTTO2.length - 1];
    const waterTemp = latest["WTR-TEMP"];

    document.getElementById("waterTemp").textContent =
      waterTemp !== undefined ? `${waterTemp} °F` : "No data available";
  } catch (err) {
    document.getElementById("waterTemp").textContent = "Error loading data";
    console.error(err);
  }
}

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
