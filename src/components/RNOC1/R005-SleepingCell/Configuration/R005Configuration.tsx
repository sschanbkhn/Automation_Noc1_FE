import React, { useState } from "react";

const Configuration = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu mẫu cho các card cấu hình, với icon SVG và mô tả
  const configCards = [
    {
      id: "mrbts_info",
      title: "MRBTS Information",
      description: "Cấu hình các thông tin liên quan đến trạm gốc (MRBTS).",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      id: "email_config",
      title: "Email",
      description: "Quản lý các thiết lập cho thông báo và cảnh báo qua email.",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
    {
      id: "file_path",
      title: "File Path",
      description: "Thiết lập đường dẫn lưu trữ cho các file log và báo cáo.",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      ),
    },
  ];

  // Lọc các card dựa trên search term
  const filteredCards = configCards.filter((card) => card.title.toLowerCase().includes(searchTerm.toLowerCase()) || card.description.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="rnoc-app-container">
      <style>
        {`
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .floating-elements {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
          }
          .floating-circle {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            animation: float 6s ease-in-out infinite;
          }
          .floating-circle:nth-child(1) { width: 80px; height: 80px; top: 20%; left: 10%; animation-delay: 0s; }
          .floating-circle:nth-child(2) { width: 120px; height: 120px; top: 60%; right: 10%; animation-delay: 2s; }
          .floating-circle:nth-child(3) { width: 60px; height: 60px; bottom: 20%; left: 20%; animation-delay: 4s; }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          .rnoc-main-container {
            max-width: 1200px;
            margin: 4rem auto;
            padding: 3rem;
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
          }
          .rnoc-search-bar {
            margin-bottom: 2rem;
          }
          .rnoc-search-bar input {
            width: 100%;
            padding: 10px 15px;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 1rem;
          }
          .rnoc-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }
          .rnoc-card {
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
          }
          .rnoc-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .rnoc-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            cursor: pointer;
          }
          .rnoc-card:hover::before {
            opacity: 1;
          }
          .rnoc-card-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
          .rnoc-card-icon svg {
            width: 28px;
            height: 28px;
            color: white;
          }
          .rnoc-card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }
          .rnoc-card-description {
            color: #718096;
            font-size: 0.9rem;
            line-height: 1.5;
          }
          .rnoc-no-results {
            grid-column: 1 / -1;
            text-align: center;
            color: #6c757d;
            font-style: italic;
            margin-top: 40px;
          }
          .rnoc-breadcrumb {
            margin-bottom: 2rem;
            color: #2d3748;
            font-size: 1.25rem;
            font-weight: 600;
            text-align: left;
            padding-bottom: 1rem;
            border-bottom: 2px solid rgba(102, 126, 234, 0.3);
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .rnoc-breadcrumb-icon {
            width: 24px;
            height: 24px;
            color: #667eea;
          }
          @media (max-width: 768px) {
            .rnoc-main-container {
              margin: 2rem auto;
              padding: 2rem;
            }
            .rnoc-card-grid {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }
            .rnoc-card {
              padding: 1.5rem;
            }
          }
        `}
      </style>
      <div className="floating-elements">
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
      </div>
      <div className="rnoc-main-container">
        <div className="rnoc-breadcrumb">
          <svg className="rnoc-breadcrumb-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Cấu hình
        </div>
        <div className="rnoc-search-bar">
          <input type="text" placeholder="🔍 Tìm kiếm thẻ cấu hình..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="rnoc-card-grid">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <div key={card.id} className="rnoc-card">
                <div className="rnoc-card-icon">{card.icon}</div>
                <h3 className="rnoc-card-title">{card.title}</h3>
                <p className="rnoc-card-description">{card.description}</p>
              </div>
            ))
          ) : (
            <div className="rnoc-no-results">
              <p>Không tìm thấy thẻ cấu hình nào cho "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
