import os
import requests
import json
from datetime import datetime, timedelta

API_KEY = os.environ.get("USGS_API_KEY")
SITE = "07195430"
PARAMS = ["00060", "00065"]  # CFS + Gage Height

# 2 years date range
end = datetime.utcnow()
start = end - timedelta(days=730)

start_str = start.strftime("%Y-%m-%dT%H:%M:%S")
end_str = end.strftime("%Y-%m-%dT%H:%M:%S")

def fetch_param(param):
    url = (
        f"https://labs.waterdata.usgs.gov/nextgen-service/v2/instantaneous-values"
        f"?sites={SITE}&parameterCode={param}"
        f"&startDT={start_str}&endDT={end_str}"
        f"&api_key={API_KEY}"
    )
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def merge_data(height_data, discharge_data):
    height_points = {}
    for entry in height_data["data"]:
        ts = entry.get("dateTime")
        val = entry.get("value")
        if ts:
            height_points[ts] = {"height_ft": val}

    for entry in discharge_data["data"]:
        ts = entry.get("dateTime")
        val = entry.get("value")
        if ts and ts in height_points:
            height_points[ts]["cfs"] = val

    merged = [
        {"timestamp": ts, **vals}
        for ts, vals in height_points.items()
        if "cfs" in vals
    ]

    return merged

def main():
    print("Fetching 2 years of stage + discharge for USGS 07195430...")
    height_json = fetch_param("00065")
    discharge_json = fetch_param("00060")

    merged = merge_data(height_json, discharge_json)

    os.makedirs("data", exist_ok=True)
    output_path = "data/07195430.json"
    with open(output_path, "w") as f:
        json.dump(merged, f, indent=2)

    print(f"Saved merged dataset: {output_path}")
    print(f"Total paired measurements: {len(merged)}")

if __name__ == "__main__":
    main()
