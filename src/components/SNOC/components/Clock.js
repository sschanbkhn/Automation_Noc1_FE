// File: src/components/Clock.js
import React, { useState, useEffect } from "react";

const Clock = ({ style }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("vi-VN"); // ví dụ: 22/07/2025
  const formattedTime = currentTime.toLocaleTimeString("vi-VN", {
    hour12: false,
  }); // ví dụ: 10:43:12

  return (
    <span style={style}>
      🕒 {formattedDate} {formattedTime}
    </span>
  );
};

export default Clock;
