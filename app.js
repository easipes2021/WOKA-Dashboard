console.log("App.js is running - Mobile Optimized");

// Global chart variables
let lakeChartInstance = null;
let convertedChartInstance = null;

// Helper: Format Time for UI
function getFormattedTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// -------------------------------------
// DARK MODE TOGGLE
// -------------------------------------
const themeToggle = document.getElementById('themeToggle');
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        initApp(); 
    });
}

// -------------------------------------
// 1. AIR TEMPERATURE
// -------------------------------------
async function getAirTemperature() {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=36.13&longitude=-94.57&current=temperature_2m&temperature_unit=fahrenheit";
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (data.current) {
            document.getElementById("airTemp").textContent = `${data.current.temperature_2m} °F`;
            document.getElementById("airTempTime").textContent = `Updated: ${getFormattedTime()}`;
        }
    } catch (err) { console.error("Temp error:", err); }
}

// -----------------------------------------------------
// 2. RATING CURVE MATH (Tuned +1.7%)
// -----------------------------------------------------
function ratingCurve_CFS(gageHeightFt) {
    const H = parseFloat(gageHeightFt);
    if (isNaN(H) || H <= 0) return 0;
    // 21.28 and 2.73 include your 1.7% calibration shift
    return H <= 5.416 ? (21.28 * Math.pow(H, 2.040)) : (2.73 * Math.pow(H, 3.019));
}

// -----------------------------------------------------
// 3. LAKE FRANCIS (STAGE)
// -----------------------------------------------------
async function loadLakeFrancisData() {
    const url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=07195495&parameterCd=00065&period=P7D";
    try {
        const res = await fetch(url, { cache: "no-store
