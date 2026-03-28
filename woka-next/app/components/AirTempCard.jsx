"use client";

import { useEffect, useState } from "react";

export default function AirTempCard() {
  const [tempF, setTempF] = useState("--");
  const [timestamp, setTimestamp] = useState("--");

  useEffect(() => {
    async function fetchAirTemp() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=36.13&longitude=-94.57&current=temperature_2m&temperature_unit=fahrenheit"
        );

        const data = await res.json();

        if (data?.current?.temperature_2m !== undefined) {
          setTempF(data.current.temperature_2m);
          setTimestamp(
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          );
        }
      } catch (err) {
        console.error("Air Temperature API Error", err);
        setTempF("Offline");
      }
    }

    fetchAirTemp();
    const interval = setInterval(fetchAirTemp, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Watts Air Temperature</h2>
      <p style={styles.value}>{tempF} °F</p>
      <p style={styles.time}>Updated: {timestamp}</p>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "500px"
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600"
  },
  value: {
    marginTop: "8px",
    fontSize: "34px",
    fontWeight: "700"
  },
  time: {
    marginTop: "6px",
    fontSize: "14px",
    opacity: 0.6
  }
};
