
import React, { useState } from "react";
import API_URL from "./apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase, faPlus, faTimes, faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";
type DichVu = "18001900";

const DownloadDoiSoatForm: React.FC = () => {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<string | null>(null); // lưu loại đang tải

  const handleDownload = async (dichVu: DichVu, fileType: "chua_chuan_hoa" | "doi_soat") => {
    // Map sang API tương ứng
    let apiPath = "";
    
    apiPath =
        fileType === "chua_chuan_hoa"  
          ? "dv18001900-download-thongke"
          : "dv18001900-download-doisoat";
    

    const url = `${API_URL}/${apiPath}/?month=${month}&year=${year}`;
    setLoading(fileType); // bật loading cho nút này

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("File không tồn tại hoặc lỗi server");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const typeName = fileType === "chua_chuan_hoa" ? "ChuaChuanHoaBE" : "DoiSoatBE_CSDL";
      link.download = `${dichVu}_${typeName}_${month}_${year}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };
// Style cơ bản tái sử dụng
  const baseButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const sectionStyle: React.CSSProperties = {
    background: "#aadfdfff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    padding: "24px",
    maxWidth: "420px",
    margin: "30px auto",
  };
  return (
    <div style={sectionStyle}>
      <h2
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          color: "#564af8ff",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <FontAwesomeIcon icon={faDownload} color="#984bf0ff" />
        DOWNLOAD BÁO CÁO DỊCH VỤ 1800/1900
      </h2>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: 600, marginBottom: "5px", display: "block" }}>
          CHỌN THÁNG BÁO CÁO
        </label>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="w-full border rounded px-2 py-1"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

       {/* Chọn năm */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: 600, marginBottom: "5px", display: "block" }}>
          CHỌN NĂM BÁO CÁO
        </label>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full border rounded px-2 py-1"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>
      </div>

      {/* Nút tải */}
      <div style={{ display: "grid", gap: "10px" }}>
        <button
          onClick={() => handleDownload("18001900", "chua_chuan_hoa")}
          disabled={loading !== null}
          style={{
            ...baseButtonStyle,
            background: loading === "chua_chuan_hoa" ? "#9ca3af" : "#16a34a",
          }}
          onMouseOver={(e) =>
            !loading && (e.currentTarget.style.background = "#15803d")
          }
          onMouseOut={(e) =>
            !loading && (e.currentTarget.style.background = "#16a34a")
          }
        >
          {loading === "chua_chuan_hoa" ? "⏳ Đang tải..." : "1800/1900 - Chưa chuẩn hoá BE"}
        </button>

         <button
          onClick={() => handleDownload("18001900", "doi_soat")}
          disabled={loading !== null}
          style={{
            ...baseButtonStyle,
            background: loading === "doi_soat" ? "#9ca3af" : "#2563eb",
          }}
          onMouseOver={(e) =>
            !loading && (e.currentTarget.style.background = "#1d4ed8")
          }
          onMouseOut={(e) =>
            !loading && (e.currentTarget.style.background = "#2563eb")
          }
        >
          {loading === "doi_soat" ? "⏳ Đang tải..." : "1800/1900 - Đối soát BE vs CSDL"}
        </button>
      </div>
    </div>
  );
};

export default DownloadDoiSoatForm;

