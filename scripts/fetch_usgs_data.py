import os
import requests
import json
from datetime import datetime, timedelta

SITE_ID = "07195430"
PARAMS = ["00060", "00065"]   # discharge + stage
DAYS_BACK = 730
OUTPUT_FILE = "data/usgs_07195430.json"

end_dt = datetime.utcnow()
start_dt = end_dt - timedelta(days=DAYS_BACK)

start = start_dt.strftime("%Y-%m-%dT%H:%MZ")
end = end_dt.strftime("%Y-%m-%dT%H:%MZ")

API_KEY = os.environ.get("USGS_API_KEY")

BASE_URL = "https://api.waterdata.usgs.gov/v3/observations/instantaneous"

full_url = (
    f"{BASE_URL}?sites={SITE_ID}"
    f"&observedProperty={','.join(PARAMS)}"
    f"&start={start}&end={end}"
    f"&api-key={API_KEY}&format=json"
)

print("Fetching:", full_url)

resp = requests.get(full_url)
resp.raise_for_status()

data = resp.json()

os.makedirs("data", exist_ok=True)
with open(OUTPUT_FILE, "w") as f:
    json.dump(data, f, indent=2)

print(f"✅ Saved data to {OUTPUT_FILE}")
