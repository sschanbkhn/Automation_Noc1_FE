// useConfigData.ts - Improved Version
import { useState } from "react";
import { configTableMapping } from "./ConfigConstants";
import API_CONFIG from "../Designer/ApiR0075GSRANPnPDeclarationConfig";

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

      const response = await fetch(config.api, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Handle different response formats
      const actualData = Array.isArray(data) ? data : data.data || data.result || [];

      setModalData(actualData);
      setOriginalModalData(actualData);
    } catch (error) {
      console.error("Error loading config data:", error);
      setModalData([]);
      setOriginalModalData([]);
      alert(`Failed to load data: ${error instanceof Error ? error.message : "Unknown error"}`);
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

    const filtered = originalModalData.filter((item: any) =>
      Object.values(item).some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    );
    setModalData(filtered);
  };

  const handleDelete = async (id: number, moduleId: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      const config = configTableMapping[moduleId];

      // Build delete URL based on module type
      let deleteUrl = "";
      switch (moduleId) {
        case 1: // Email
          deleteUrl = `${config.api.replace("get-outlook", "destroy-outlook")}/${id}`;
          break;
        case 2: // File Path
          deleteUrl = `${config.api.replace("get-filepath", "delete-filepath")}/${id}`;
          break;
        case 3: // MRBTS
          deleteUrl = `${config.api.replace("get-mrbts", "delete-mrbts")}/${id}`;
          break;
        case 4: // Reset Limits
          deleteUrl = `${config.api.replace("get-resetlimits", "delete-resetlimits")}/${id}`;
          break;
        case 5: // Scheduler
          deleteUrl = `${config.api.replace("get-scheduler", "delete-scheduler")}/${id}`;
          break;
        case 6: // Database
          // deleteUrl = `${config.api.replace("get-infor-database", "delete-infor-database")}/${id}`;
          deleteUrl = API_CONFIG.BASE_URL + "/configuration/delete-database/" + id;
          // deleteUrl = `${API_CONFIG.BASE_URL}/configuration/delete-database/${id}`;
          break;
        case 7: // SSH
          deleteUrl = `${config.api.replace("get-ssh-accounts", "delete-ssh-accounts")}/${id}`;
          // deleteUrl = API_CONFIG.BASE_URL + "/configuration/delete-database/" + id;
          break;
        default:
          deleteUrl = `${config.api.replace("get-", "delete-")}/${id}`;
      }

      console.log("Delete URL:", deleteUrl);

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Xóa thành công!");
        // Refresh data
        await loadConfigData(moduleId);
      } else {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Xóa thất bại: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleSave = async (formData: any, moduleId: number, editingItem?: any) => {
    try {
      const config = configTableMapping[moduleId];

      // Build save URL based on module type and operation (add/update)
      let saveUrl = "";
      let method = "";

      if (editingItem) {
        // Update operation
        method = "PUT";
        switch (moduleId) {
          case 1: // Email
            saveUrl = `${config.api.replace("get-outlook", "update-outlook")}/${editingItem.id}`;
            break;
          case 2: // File Path
            saveUrl = `${config.api.replace("get-filepath", "update-filepath")}/${editingItem.id}`;
            break;
          case 3: // MRBTS
            saveUrl = `${config.api.replace("get-mrbts", "update-mrbts")}/${editingItem.id}`;
            break;
          case 4: // Reset Limits
            saveUrl = `${config.api.replace("get-resetlimits", "update-resetlimits")}/${editingItem.id}`;
            break;
          case 5: // Scheduler
            saveUrl = `${config.api.replace("get-scheduler", "update-scheduler")}/${editingItem.id}`;
            break;
          case 6: // Database
            saveUrl = `${config.api.replace("get-infor-database", "update-database")}/${editingItem.id}`;
            break;
          case 7: // SSH
            saveUrl = `${config.api.replace("get-ssh-accounts", "update-ssh-accounts")}/${editingItem.id}`;
            break;
          default:
            saveUrl = `${config.api.replace("get-", "update-")}/${editingItem.id}`;
        }
      } else {
        // Add operation
        method = "POST";
        switch (moduleId) {
          case 1: // Email
            saveUrl = config.api.replace("get-outlook", "add-outlook");
            break;
          case 2: // File Path
            saveUrl = config.api.replace("get-filepath", "add-filepath");
            break;
          case 3: // MRBTS
            saveUrl = config.api.replace("get-mrbts", "add-mrbts");
            break;
          case 4: // Reset Limits
            saveUrl = config.api.replace("get-resetlimits", "add-resetlimits");
            break;
          case 5: // Scheduler
            saveUrl = config.api.replace("get-scheduler", "add-scheduler");
            break;
          case 6: // Database
            saveUrl = config.api.replace("get-infor-database", "add-database");
            break;
          case 7: // SSH
            saveUrl = config.api.replace("get-ssh-accounts", "add-ssh-accounts");
            break;
          default:
            saveUrl = config.api.replace("get-", "add-");
        }
      }

      console.log("Save URL:", saveUrl);
      console.log("Method:", method);
      console.log("Form Data:", formData);

      const response = await fetch(saveUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Save response:", result);
        alert(editingItem ? "Cập nhật thành công!" : "Thêm mới thành công!");

        // Refresh data
        await loadConfigData(moduleId);
        return true;
      } else {
        const errorText = await response.text();
        console.error("Save failed:", errorText);
        throw new Error(`Save failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert(`Lưu thất bại: ${error instanceof Error ? error.message : "Unknown error"}`);
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
