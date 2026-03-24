// -------------------------------------
// Fetch Water Temperature (USACE WTTO2)
// -------------------------------------
async function getWaterTemperature() {
  try {
    const url = "https://www.swt-wc.usace.army.mil/webdata/gagedata/WTTO2.csv";
    const res = await fetch(url);
    const csvText = await res.text();

    const lines = csvText.trim().split("\n");

    // Last line = latest data reading
    const lastLine = lines[lines.length - 1];

    // Split CSV columns by comma
    const cols = lastLine.split(",");

    // USACE CSV includes water temp under column 'WTR-TEMP'
    // Typically this is at column index 5 or 6 depending on the station layout.
    // We search for it dynamically in the header.

    // Parse header row
    const header = lines[0].split(",");
    const tempIndex = header.indexOf("WTR-TEMP");

    if (tempIndex === -1) {
      document.getElementById("waterTemp").textContent = "Temperature not available";
      console.error("WTR-TEMP column not found:", header);
      return;
    }

    const waterTemp = cols[tempIndex];

    document.getElementById("waterTemp").textContent =
      waterTemp ? `${waterTemp} °F` : "No data available";

  } catch (err) {
    document.getElementById("waterTemp").textContent = "Error loading data";
    console.error("WTTO2 CSV fetch error:", err);
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
