import React, { useState } from "react";
import API_URL from "./apiConfig";
import 'bootstrap/dist/css/bootstrap.min.css';

function ScheduleForm() {
  const [date, setDate] = useState("");   // yyyy-mm-dd
  const [time, setTime] = useState("");   // hh:mm


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!date || !time) {
    alert("Chọn ngày và giờ!");
    return;
  }

  // Tách ngày và giờ
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");

  const payload = { year, month, day, hour, minute };
  console.log("Dữ liệu gửi tới backend:", JSON.stringify(payload));

  try {
    const res = await fetch(`${API_URL}/update-schedule/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Server trả lỗi: parse text để tránh crash khi không phải JSON
      const text = await res.text();
      console.error("Server trả lỗi:", text);
      alert("Lỗi từ server: " + text);
      return;
    }

    const data = await res.json();
    console.log("Server trả về:", data);
    alert("Cập nhật lịch thành công:\n" + JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
    alert("Có lỗi khi gửi request");
  }
};
  return (
     <div className="container mt-4">
    <div
        className="card shadow border-0"
        style={{ backgroundColor: "#f8f5ff", width: "50%", margin: "0 auto" }}
      >
      <div className="card-body">
        <h5 className="text-center fw-bold text-primary mb-2">
         Lập lịch cho chế độ đối soát định kỳ
        </h5>
        <p className="text-muted text-center mb-4">
          Vui lòng chọn ngày và giờ để hệ thống tự động thực hiện đối soát.
        </p>

        <form onSubmit={handleSubmit} className="px-2">
          <div className="mb-3">
            <label className="form-label fw-semibold">Thiết lập Ngày</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Thiết lập Giờ</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn text-white fw-semibold"
              style={{ backgroundColor: "#9249f3ff" }}
            >
              Cập nhật lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}

export default ScheduleForm;
