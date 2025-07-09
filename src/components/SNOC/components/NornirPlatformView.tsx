// src/pages/NornirPlatformView.tsx
import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import snocStore, { RootState, AppDispatch } from "../store/snocStore";
import { fetchSNOCPlatformView } from "../redux/Healthcheck/snocSlice";

interface Platform {
  name: string;
  device_count: number;
}

const PlatformViewContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { platforms, loading, error } = useSelector(
    (state: RootState) => state.snoc
  );

  useEffect(() => {
    dispatch(fetchSNOCPlatformView());
  }, [dispatch]);

  return (
    <div
      style={{
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 24,
      }}
    >
      <h2
        style={{
          color: "#2563eb",
          fontWeight: 800,
          fontSize: 28,
          marginBottom: 24,
          letterSpacing: 1,
          textAlign: "center",
          textShadow: "0 2px 8px #e0e7ef",
        }}
      >
        Danh sách Platform SNOC
      </h2>
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          padding: 32,
          minWidth: 340,
          maxWidth: 600,
          width: "100%",
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <span
              className="loader"
              style={{
                display: "inline-block",
                width: 32,
                height: 32,
                border: "4px solid #2563eb",
                borderTop: "4px solid #fff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                verticalAlign: "middle",
              }}
            ></span>
            <div style={{ marginTop: 12 }}>Đang tải dữ liệu platform...</div>
          </div>
        )}
        {error && (
          <div
            style={{
              color: "red",
              fontWeight: 600,
              textAlign: "center",
              padding: 24,
            }}
          >
            {error}
          </div>
        )}
        {!loading && !error && platforms.length === 0 && (
          <div style={{ textAlign: "center", color: "#888", padding: 32 }}>
            <svg
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
              style={{ marginBottom: 8 }}
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                fill="#e0e7ef"
              />
            </svg>
            Không có dữ liệu platform.
          </div>
        )}
        {!loading && !error && platforms.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px #e0e7ef",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f6fa" }}>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#2563eb",
                      borderTopLeftRadius: 12,
                    }}
                  >
                    Platform Name
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#2563eb",
                      borderTopRightRadius: 12,
                      textAlign: "center",
                    }}
                  >
                    Device Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((platform: Platform, index: number) => (
                  <tr
                    key={index}
                    style={{
                      background: index % 2 ? "#f8fafc" : "#fff",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#e0e7ef")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background =
                        index % 2 ? "#f8fafc" : "#fff")
                    }
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      {platform.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        fontSize: 15,
                        textAlign: "center",
                        color: "#2563eb",
                      }}
                    >
                      {platform.device_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}
      </style>
    </div>
  );
};

const NornirPlatformView = () => (
  <Provider store={snocStore}>
    <PlatformViewContent />
  </Provider>
);

export default NornirPlatformView;
