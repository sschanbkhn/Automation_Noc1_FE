import { useState } from "react";
import { configTableMapping } from "./ConfigConstants";

export const useConfigData = () => {
  const [modalData, setModalData] = useState([]);
  const [originalModalData, setOriginalModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  const loadConfigData = async (moduleId: number) => {
    setModalLoading(true);
    try {
      const config = configTableMapping[moduleId];
      console.log("Loading data from API:", config.api);

      const response = await fetch(config.api);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      setModalData(data);
      setOriginalModalData(data);
    } catch (error) {
      console.error("Error loading config data:", error);
      setModalData([]);
      setOriginalModalData([]);
      // Có thể thêm toast notification ở đây
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalSearch = (searchValue: string) => {
    setModalSearchTerm(searchValue);
    if (!searchValue.trim()) {
      setModalData(originalModalData);
      return;
    }

    const filtered = originalModalData.filter((item: any) => Object.values(item).some((value) => String(value).toLowerCase().includes(searchValue.toLowerCase())));
    setModalData(filtered);
  };

  const handleDelete = async (id: number, moduleId: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      const config = configTableMapping[moduleId];
      const deleteUrl = config.api.replace("get-", "delete-");

      const response = await fetch(`${deleteUrl}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh data
        await loadConfigData(moduleId);
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Xóa thất bại!");
    }
  };

  const handleSave = async (formData: any, moduleId: number, editingItem?: any) => {
    try {
      const config = configTableMapping[moduleId];
      const baseUrl = config.api.replace("get-", "");
      const url = editingItem ? `${baseUrl}update-/${editingItem.id}` : `${baseUrl}add-`;

      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh data
        await loadConfigData(moduleId);
        return true;
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Lưu thất bại!");
      return false;
    }
  };

  return {
    modalData,
    originalModalData,
    modalLoading,
    modalSearchTerm,
    loadConfigData,
    handleModalSearch,
    handleDelete,
    handleSave,
    setModalData,
  };
};
