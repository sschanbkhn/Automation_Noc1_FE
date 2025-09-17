import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

// Import types
import { ConfigModule } from "./ConfigTypes";

// Import constants
import { configModules } from "./ConfigConstants";

// Import utils
import { getStatusBadge, createEmptyFormData } from "./ConfigUtilsR005";

// Import hooks
import { useConfigData } from "./useConfigData";

// Import components
import DataTableModal from "./DataTableModal";
import AddEditModal from "./AddEditModal";
import ArchiveModal from "./ArchiveModal";

import MRBTSModal from "./MRBTSModal";

const Configuration: React.FC = () => {
  // States for search and modal management
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigModule | null>(null);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // THÊM: Riêng search term cho từng modal
  const [mrbtsSearchTerm, setMrbtsSearchTerm] = useState("");
  const [archiveSearchTerm, setArchiveSearchTerm] = useState("");
  const [schedulerSearchTerm, setSchedulerSearchTerm] = useState("");

  // Custom hook for data management
  const { modalData, modalLoading, modalSearchTerm, loadConfigData, handleModalSearch, handleDelete, handleSave } = useConfigData();

  // Filter modules based on search
  const filteredModules = configModules.filter((module) => module.title.toLowerCase().includes(searchTerm.toLowerCase()) || module.description.toLowerCase().includes(searchTerm.toLowerCase()));

  // Thêm state:
  const [showMRBTSModal, setShowMRBTSModal] = useState(false);

  // Handle card click - route to appropriate modal
  const handleCardClick = async (module: ConfigModule) => {
    setSelectedConfig(module);

    switch (module.id) {
      case 8: // Detail Archive Reports - special modal
        setShowArchiveModal(true);
        break;

      case 5: // Scheduler - needs special handling for date selection
        // For now, treat as normal. Later can add date picker
        setShowModal(true);
        await loadConfigData(module.id);
        break;

      // Trong handleCardClick:
      case 3: // MRBTS - special modal
        setShowMRBTSModal(true);
        await loadConfigData(module.id);
        break;

      default: // Normal modules (1,2,4,6,7)
        setShowModal(true);
        await loadConfigData(module.id);
        break;
    }
  };

  // Handle add new item
  const handleAddNew = () => {
    setEditingItem(null);

    if (modalData && modalData.length > 0) {
      const sampleItem = modalData[0];
      const emptyForm = createEmptyFormData(sampleItem, selectedConfig!.id);
      setFormData(emptyForm);
    } else {
      setFormData({});
    }

    setShowAddEditModal(true);
  };

  // Handle edit item
  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowAddEditModal(true);
  };

  // Handle save form
  const handleSaveForm = async () => {
    if (!selectedConfig) return;

    const success = await handleSave(formData, selectedConfig.id, editingItem);
    if (success) {
      setShowAddEditModal(false);
      setEditingItem(null);
      setFormData({});

      // THÊM: Force refresh modal data
      await loadConfigData(selectedConfig.id);
    }
  };

  // Handle delete with confirmation
  const handleDeleteItem = async (id: number) => {
    if (!selectedConfig) return;
    await handleDelete(id, selectedConfig.id);
  };

  // Close all modals
  /*
  const closeAllModals = () => {
    setShowModal(false);
    setShowAddEditModal(false);
    setShowArchiveModal(false);
    setSelectedConfig(null);
    setEditingItem(null);
    setFormData({});
  };

  */
  const closeAllModals = () => {
    setShowModal(false);
    setShowMRBTSModal(false); // THÊM dòng này
    setShowAddEditModal(false);
    setShowArchiveModal(false);
    setSelectedConfig(null);
    setEditingItem(null);
    setFormData({});

    // Reset search terms
    setMrbtsSearchTerm("");
    setArchiveSearchTerm("");
    setSchedulerSearchTerm("");
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        minHeight: "500px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Search Bar */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <input
            type="text"
            placeholder="Search configurations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 20px 12px 45px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
          />
          <FontAwesomeIcon
            icon={faSearch}
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          />
        </div>
      </div>
      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {filteredModules.map((module: ConfigModule) => (
          <div
            key={module.id}
            style={{
              position: "relative",
              background: "white",
              border: "2px solid #f1f5f9",
              borderRadius: "16px",
              padding: "20px 16px 16px 16px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              minHeight: "160px",
              maxWidth: "280px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            onClick={() => handleCardClick(module)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = module.iconColor;
              e.currentTarget.style.background = `linear-gradient(135deg, ${module.iconColor}15, ${module.iconColor}10)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = "#f1f5f9";
              e.currentTarget.style.background = "white";
            }}
          >
            {/* Status Dot */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "8px",
                height: "8px",
                background: module.status === "active" ? "#10b981" : "#f59e0b",
                borderRadius: "50%",
                border: "2px solid white",
              }}
            />

            {/* Content */}
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 0 12px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: module.iconColor,
                  borderRadius: "16px",
                  boxShadow: `0 8px 25px ${module.iconColor}40`,
                }}
              >
                <FontAwesomeIcon icon={module.icon} style={{ fontSize: "24px", color: "white" }} />
              </div>

              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: "0 0 6px 0",
                  lineHeight: "1.2",
                  textAlign: "center",
                }}
              >
                {module.title}
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  margin: "0",
                  lineHeight: "1.3",
                  textAlign: "center",
                }}
              >
                {module.description}
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              {getStatusBadge(module.status)}
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "white",
            borderRadius: "16px",
            border: "2px dashed #e2e8f0",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ color: "#64748b", fontSize: "18px", margin: "0 0 8px 0" }}>No configurations found</h3>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 20px 0" }}>Try adjusting your search terms</p>
          <button
            onClick={() => setSearchTerm("")}
            style={{
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Normal Modal */}
      <DataTableModal
        show={showModal}
        selectedConfig={selectedConfig}
        modalData={modalData}
        modalLoading={modalLoading}
        modalSearchTerm={modalSearchTerm} // Dùng chung
        onSearch={handleModalSearch}
        onClose={closeAllModals}
        onAdd={handleAddNew}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />

      {/* MRBTS Modal - search term riêng */}
      <MRBTSModal
        show={showMRBTSModal}
        selectedConfig={selectedConfig}
        modalData={modalData}
        modalLoading={modalLoading}
        modalSearchTerm={mrbtsSearchTerm} // Search term riêng
        onSearch={setMrbtsSearchTerm} // Set trực tiếp
        onClose={closeAllModals}
        onAdd={handleAddNew}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        onRefresh={() => selectedConfig && loadConfigData(selectedConfig.id)}
      />

      {/* Archive Modal - search term riêng */}
      <ArchiveModal show={showArchiveModal} onClose={closeAllModals} onEdit={handleEditItem} onAdd={handleAddNew} />

      {/* Empty State check */}
      <AddEditModal show={showAddEditModal} selectedConfig={selectedConfig} editingItem={editingItem} formData={formData} setFormData={setFormData} onSave={handleSaveForm} onClose={() => setShowAddEditModal(false)} />
    </div>
  );
};

export default Configuration;
