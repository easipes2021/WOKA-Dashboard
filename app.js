console.log("App.js is running");

// Global chart variables to allow refreshing without canvas errors
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
const body = document.body;

// Check for saved user preference on load
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️ Light Mode';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙 Dark Mode';
        }
        
        // Re-run graphs so they can detect the new theme if you've added color logic
        initApp(); 
    });
}

// -------------------------------------
// 1. Fetch Air Temperature
// -------------------------------------
async function getAirTemperature() {
    const tempDisplay = document.getElementById("airTemp");
    const timeDisplay = document.getElementById("airTempTime");

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=36.13&longitude=-94.57&current=temperature_2m&temperature_unit=fahrenheit`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.current) {
            tempDisplay.textContent = `${data.current.temperature_2m} °F`;
            if (timeDisplay) {
                timeDisplay.textContent = `Updated: ${getFormattedTime()}`;
            }
        }
    } catch (err) {
        console.error("Temp fetch error:", err);
        if (tempDisplay) tempDisplay.textContent = "Error";
    }
}

// -----------------------------------------------------
// 2. LAKE FRANCIS CURRENT LEVEL
// -----------------------------------------------------
async function loadLakeFrancisCurrent() {
    const url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=07195495&parameterCd=00065";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const value = data.value.timeSeries[0].values[0].value[0].value;

        document.getElementById("lakeFrancisCurrent").textContent = value + " ft";
        document.getElementById("lakeFrancisTime").textContent = `Updated: ${getFormattedTime()}`;
    } catch (err) {
        console.error("Error loading Lake Francis current level:", err);
    }
}

// -----------------------------------------------------
// 3. LAKE FRANCIS GRAPH (7-DAY)
// -----------------------------------------------------
async function loadLakeFrancisGraph() {
    const url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=07195495&parameterCd=00065&period=P7D";
    try {
        const res = await fetch(url);
        const data = await res.json();

        const values = data.value.timeSeries[0].values[0].value.map((v) => ({
            time: v.dateTime,
            height: parseFloat(v.value),
        }));

        const labels = values.map((v) => new Date(v.time).toLocaleDateString());
        const heights = values.map((v) => v.height);
        const ctx = document.getElementById("lakeFrancisChart");

        if (lakeChartInstance) lakeChartInstance.destroy();

        lakeChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Gage Height (ft)",
                    data: heights,
                    borderColor: "#0077cc",
                    backgroundColor: "rgba(0, 119, 204, 0.3)",
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { autoSkip: true, maxRotation: 0 } },
                    y: { title: { display: true, text: "Feet" } }
                }
            }
        });

        const scrub = document.getElementById("scrubValue");
        ctx.onmousemove = (event) => {
            const points = lakeChartInstance.getElementsAtEventForMode(event, "index", { intersect: false }, true);
            if (points.length) {
                const i = points[0].index;
                scrub.textContent = `${labels[i]} — ${heights[i]} ft`;
            }
        };

        document.getElementById("lakeFrancisGraphTime").textContent = `Updated: ${getFormattedTime()}`;
    } catch (err) {
        console.error("Error loading Lake Francis Graph:", err);
    }
}

// -----------------------------------------------------
// 4. SILOAM SPRINGS CURRENT FLOW (With Fallback)
// -----------------------------------------------------
function ratingCurve_CFS(gageHeightFt) {
    const H = Number(gageHeightFt);
    if (!isFinite(H) || H <= 0) return null;
    return H <= 5.416 ? 20.93 * Math.pow(H, 2.040) : 2.68 * Math.pow(H, 3.019);
}

async function getSiloamStage() {
    const url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=07195430&parameterCd=00065";
    const resp = await fetch(url);
    const data = await resp.json();
    return parseFloat(data.value.timeSeries[0].values[0].value[0].value);
}

async function getLiveCFS(stageFt) {
    const url = `https://woka-rating-api.onrender.com/flow?stage=${stageFt}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("API not responding");
    const data = await resp.json();
    return data.discharge_cfs;
}

async function updateSiloamCurrentFlow() {
    const displayEl = document.getElementById("siloamCurrent");
    const timeEl = document.getElementById("siloamTime");
    
    const cachedFlow = localStorage.getItem("siloamLastFlow");
    const cachedTime = localStorage.getItem("siloamLastTimeFormatted");
    
    if (cachedFlow) {
        displayEl.innerHTML = `${cachedFlow} CFS <br><span class="refreshing-text">(Refreshing...)</span>`;
        timeEl.textContent = `Last seen: ${cachedTime}`;
    }

    try {
        const stage = await getSiloamStage();
        let cfs;
        try {
            cfs = await getLiveCFS(stage);
        } catch (apiErr) {
            cfs = ratingCurve_CFS(stage);
        }

        if (cfs !== null) {
            const timeNow = getFormattedTime();
            displayEl.textContent = `${cfs.toFixed(1)} CFS`;
            timeEl.textContent = `Updated: ${timeNow}`;
            localStorage.setItem("siloamLastFlow", cfs.toFixed(1));
            localStorage.setItem("siloamLastTimeFormatted", timeNow);
        }
    } catch (err) {
        console.error("SSKP Flow Update failed:", err);
    }
}

// -----------------------------------------------------
// 5. SSKP HISTORIC CONVERTED GRAPH
// -----------------------------------------------------
async function drawConvertedGraph() {
    try {
        const resp = await fetch("https://woka-rating-api.onrender.com/historic-converted");
        const points = await resp.json();

        const labels = points.map(p => new Date(p.timestamp).toLocaleDateString());
        const cfsValues = points.map(p => p.converted_cfs);
        const ctx = document.getElementById("convertedChart");

        if (convertedChartInstance) convertedChartInstance.destroy();

        convertedChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Flow (CFS)",
                    data: cfsValues,
                    borderColor: "#ffa500",
                    backgroundColor: "rgba(255, 165, 0, 0.2)",
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { autoSkip: true, maxRotation: 0 } },
                    y: { title: { display: true, text: "CFS" } }
                }
            }
        });

        const scrub = document.getElementById("convertedScrub");
        ctx.onmousemove = (event) => {
            const pointsAtEvent = convertedChartInstance.getElementsAtEventForMode(event, "index", { intersect: false }, true);
            if (pointsAtEvent.length) {
                const i = pointsAtEvent[0].index;
                scrub.textContent = `${labels[i]} — ${cfsValues[i].toFixed(0)} CFS`;
            }
        };

        document.getElementById("convertedGraphTime").textContent = `Updated: ${getFormattedTime()}`;
    } catch (err) {
        console.error("Historic flow failed:", err);
    }
}

// -----------------------------------------------------
// INITIALIZER
// -----------------------------------------------------
async function initApp() {
    await Promise.allSettled([
        getAirTemperature(),
        loadLakeFrancisGraph(),
        loadLakeFrancisCurrent(),
        updateSiloamCurrentFlow(),
        drawConvertedGraph()
    ]);
}

document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setInterval(initApp, 15 * 60 * 1000);
});
