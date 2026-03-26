import os
import requests
import json
from datetime import datetime, timedelta

# -------------------------------
# CONFIG
# -------------------------------
SITE_ID = "07195430"
PARAMS = "00060,00065"      # discharge + gage height
DAYS_BACK = 730             # 2 years
OUTPUT_FILE = "data/usgs_07195430.json"

# -------------------------------
# DATE RANGE (2 years)
# -------------------------------
end_dt = datetime.utcnow()
start_dt = end_dt - timedelta(days=DAYS_BACK)

start = start_dt.strftime("%Y-%m-%d")
end = end_dt.strftime("%Y-%m-%d")

# -------------------------------
# NWIS INSTANTANEOUS VALUES API
# -------------------------------
BASE_URL = "https://waterservices.usgs.gov/nwis/iv/"

url = (
    f"{BASE_URL}?format=json"
    f"&sites={SITE_ID}"
    f"&parameterCd={PARAMS}"
    f"&startDT={start}"
    f"&endDT={end}"
)

print("Fetching: " + url)

# -------------------------------
# FETCH DATA
# -------------------------------
resp = requests.get(url)
resp.raise_for_status()

data = resp.json()

# -------------------------------
# SAVE OUTPUT
# -------------------------------
os.makedirs("data", exist_ok=True)
with open(OUTPUT_FILE, "w") as f:
    json.dump(data, f, indent=2)

print(f"✅ Saved data to {OUTPUT_FILE}")
