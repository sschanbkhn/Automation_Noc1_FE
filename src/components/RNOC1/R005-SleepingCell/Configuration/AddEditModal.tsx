import React from "react";
import { ConfigModule } from "./ConfigTypes";
import { shouldHideColumn } from "./ConfigUtilsR005";

interface AddEditModalProps {
  show: boolean;
  selectedConfig: ConfigModule | null;
  editingItem: any;
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const AddEditModal: React.FC<AddEditModalProps> = ({ show, selectedConfig, editingItem, formData, setFormData, onSave, onClose }) => {
  if (!show || !selectedConfig) return null;

  const handleSave = async () => {
    await onSave();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        zIndex: 1001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "90vw",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: selectedConfig.iconColor,
            color: "white",
            padding: "20px",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <h3 style={{ margin: 0 }}>
            {editingItem ? "Edit" : "Add New"} {selectedConfig.title}
          </h3>
        </div>

        {/* Form */}
        <div style={{ padding: "20px" }}>
          {Object.keys(formData)
            .filter((key) => !shouldHideColumn(key, selectedConfig.id))
            .map((key) => (
              <div key={key} style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}</label>

                {/* Blacklist boolean field */}
                {key.toLowerCase().includes("blacklist") ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      id={key}
                      checked={formData[key] === true} // Đảm bảo chỉ true mới check
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    />
                    <label htmlFor={key} style={{ cursor: "pointer" }}>
                      {formData[key] ? "Blacklisted" : "Not Blacklisted"}
                    </label>
                  </div>
                ) : key.toLowerCase().includes("note") ? (
                  /* Note field - unlimited characters */
                  <textarea
                    value={formData[key] || ""}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      resize: "vertical",
                    }}
                  />
                ) : typeof formData[key] === "boolean" ? (
                  /* Other boolean fields */
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="checkbox" checked={formData[key] || false} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} />
                    <label>{formData[key] ? "Active" : "Inactive"}</label>
                  </div>
                ) : (
                  /* Regular text fields */
                  <input type="text" value={formData[key] || ""} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
                )}
              </div>
            ))}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              onClick={handleSave}
              style={{
                background: selectedConfig.iconColor,
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditModal;
