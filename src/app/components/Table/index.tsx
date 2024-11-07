"use client";
import React from "react"; // Added React import
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/app/utils/utils";
import { toast } from "react-toastify";
import TableRow from "./TableRow";
import {
  Item,
  ItemProperty,
  Manager,
  TableProps,
  Column,
  ColumnToggleProps,
} from "@/app/types/table";
import { FiPlus, FiSave } from "react-icons/fi";
import ManagersModal from "./ManagersModal";
import ReactModal from "react-modal";
import { Switch } from "@headlessui/react"; // Add this import

// Add this after imports
ReactModal.setAppElement("body"); // Set the root element for accessibility

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "2rem",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
};

const STORAGE_KEY = "table-column-preferences";
const DEFAULT_COLUMNS = [
  "type",
  "title",
  "description",
  "beginTime",
  "endTime",
  "owner",
  "diffLevel", // Move diffLevel before progress
  "progress",
];

const allColumns: Column[] = [
  { id: "title", label: "Tiêu đề" },
  { id: "description", label: "Nội dung" },
  { id: "beginTime", label: "Ngày bắt đầu" },
  { id: "endTime", label: "Ngày Kết thúc" },
  { id: "owner", label: "Người sở hữu" },
  { id: "diffLevel", label: "Mức độ" }, // Move diffLevel before progress
  { id: "progress", label: "Tiến độ" },
];

// Add this component before the Table component
const ColumnToggle = ({ enabled, onChange }: ColumnToggleProps) => {
  return (
    <Switch
      checked={enabled}
      onChange={onChange}
      className={`${
        enabled ? "bg-blue-500" : "bg-gray-200"
      } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
    >
      <span className="sr-only">Enable column</span>
      <span
        className={`${
          enabled ? "translate-x-5" : "translate-x-1"
        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
      />
    </Switch>
  );
};

export default function Table({
  current,
  setHistory,
  reloadTableData,
  setReloadTableData,
}: TableProps) {
  // Existing state variables
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [listProject, setListProject] = useState<Item[]>([]);
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(DEFAULT_COLUMNS);

  // Move localStorage logic to useEffect
  useEffect(() => {
    // Only run this effect on the client side
    const savedColumns = localStorage.getItem(STORAGE_KEY);
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns);
        setSelectedColumns(parsed);
      } catch {
        console.error("Failed to parse saved column preferences");
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  const [isColumnSelectorOpen, setIsColumnSelectorOpen] =
    useState<boolean>(false);

  // New state variables for modals
  const [showManagers, setShowManagers] = useState<boolean>(false);
  const [currentManagerItem, setCurrentManagerItem] = useState<Item | null>(
    null
  );
  const [managerPermissions, setManagerPermissions] = useState<Manager[]>([]);

  const handleOpenManagers = (item: Item) => {
    setCurrentManagerItem(item);
    setShowManagers(true);
  };

  // Fetch managers' permissions when modal opens
  useEffect(() => {
    const fetchManagersPermissions = async () => {
      if (currentManagerItem) {
        try {
          const response = await apiClient.get<Manager[]>(
            `/api/project/${currentManagerItem.id}/managers_permissions/` // Ensure correct API path
          );
          setManagerPermissions(response.data);
        } catch {
          toast.error("Không thể lấy dữ liệu quản lý");
        }
      }
    };

    if (showManagers) {
      fetchManagersPermissions();
    }
  }, [showManagers, currentManagerItem]);

  // Modify the toggleColumn function to use useCallback and handle toasts properly
  const toggleColumn = useCallback((columnId: string) => {
    setSelectedColumns((prev) => {
      const isRemoving = prev.includes(columnId);

      // Prevent removing if it would leave less than 1 column
      if (isRemoving && prev.length <= 1) {
        // Instead of showing toast immediately, return the same state
        // and schedule the toast for the next tick
        setTimeout(() => {
          toast.warning("Phải hiển thị ít nhất 1 cột");
        }, 0);
        return prev;
      }

      const newColumns = isRemoving
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId];

      return newColumns;
    });
  }, []); // Empty dependencies array since this function doesn't depend on any props or state

  const handleChange = (
    index: number,
    name: ItemProperty,
    value: string | number | boolean | null
  ) => {
    setListProject((prevList) => {
      const currentItem = prevList[index];
      if (currentItem[name] === value) {
        return prevList;
      }

      const updatedItem = { ...currentItem, [name]: value };
      const updatedList = [...prevList];
      updatedList[index] = updatedItem;
      return updatedList;
    });
  };

  const handleEditItem = async (index: number) => {
    const currentItem = listProject[index];
    setListProject((prevList) => {
      const updatedList = [...prevList];
      updatedList[index] = {
        ...currentItem,
        isEditing: !currentItem.isEditing,
      };
      return updatedList;
    });

    if (currentItem.isEditing) {
      try {
        await apiClient.put(`/api/project/${currentItem.id}/`, currentItem); // Ensure correct API path
        toast.success("Cập nhật thành công!");
      } catch {
        toast.error("Cập nhật không thành công");
      }
    }
  };

  const handleDeleteItem = (id: number | null) => {
    if (id === null) {
      toast.error("ID không hợp lệ");
      return;
    }

    const itemToDelete = listProject.find((item) => item.id === id);
    const isNewItem =
      isCreating &&
      itemToDelete &&
      itemToDelete.id === listProject[listProject.length - 1].id;

    const confirmDelete = () => {
      if (isNewItem) {
        setListProject((prevList) => prevList.filter((item) => item.id !== id));
        setIsCreating(false);
        toast.success("Đã xoá nhiệm vụ mới tạo!");
      } else {
        apiClient
          .delete(`/api/project/${id}/`) // Ensure correct API path
          .then(() => {
            toast.success("Xóa nhiệm vụ thành công!");
            setListProject((prevList) =>
              prevList.filter((item) => item.id !== id)
            );
          })
          .catch(() => {
            toast.error("Không thể xóa nhiệm vụ");
          });
      }
    };

    toast(
      <div className="flex flex-col items-start space-y-2">
        <p>Bạn có chắc chắn muốn xóa nhiệm vụ này?</p>
        <button
          onClick={confirmDelete}
          className="bg-red-600 text-white px-4 py-2 rounded shadow-lg bg-opacity-80 hover:bg-red-700 transition"
        >
          Xóa
        </button>
      </div>,
      {
        position: "bottom-right",
        autoClose: false,
        closeOnClick: true,
        draggable: false,
      }
    );
  };

  const getProjects = async (url: string) => {
    try {
      const { data } = await apiClient.get<Item[]>(url);
      const newData = data.filter((item) => item.type !== "personal");
      newData.forEach((item, index) => {
        item.index = index;
        item.isEditing = false;
      });
      setListProject(newData);
    } catch {
      toast.error("Lấy dữ liệu không thành công");
    }
  };

  useEffect(() => {
    getProjects(current.url);
  }, [current.url, reloadTableData]);

  const handleCreateAndSaveItem = async () => {
    if (!isCreating) {
      const newItem: Item = {
        id: Date.now(), // Assign a unique temporary ID
        index: listProject.length,
        type: "task",
        title: null,
        description: null,
        beginTime: null,
        endTime: null,
        progress: 0,
        manager: null,
        parentId: current.id || null,
        isEditing: true,
        managers: [],
        owner: null, // Initialize owner as null
        managersCount: 0, // Add managersCount property
        diffLevel: null, // Add diffLevel property
      };
      const newListProject = [...listProject, newItem];
      setListProject(newListProject);
      setIsCreating(true);
    } else {
      const newItem = listProject[listProject.length - 1];
      if (!newItem.title || newItem.title.trim() === "") {
        toast.error("Tiêu đề là bắt buộc");
        return;
      }
      try {
        const response = await apiClient.post<Item>("/api/project/", newItem); // Ensure correct API path
        // Assuming the backend returns the created item with a unique ID
        const createdItem: Item = response.data;
        setListProject((prevList) =>
          prevList.map((item) =>
            item.id === listProject[listProject.length - 1].id
              ? createdItem
              : item
          )
        );
        toast.success("Tạo mới nhiệm vụ thành công!");
        setIsCreating(false);
        getProjects(current.url); // Refresh table
      } catch {
        toast.error("Không thể tạo mới nhiệm vụ");
      }
    }
  };

  // Function to handle progress updates
  const handleUpdateProgress = async (id: number, progress: number) => {
    try {
      await apiClient.patch(`/api/project/${id}/`, { progress }); // Ensure correct API path
      setListProject((prevList) =>
        prevList.map((item) => (item.id === id ? { ...item, progress } : item))
      );
      toast.success("Cập nhật tiến độ thành công!");
    } catch {
      toast.error("Cập nhật tiến độ không thành công");
    }
  };

  // Add this effect to save changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedColumns));
    }
  }, [selectedColumns]);

  // Modify the resetColumnPreferences function to use setTimeout for toast
  const resetColumnPreferences = useCallback(() => {
    setSelectedColumns(DEFAULT_COLUMNS);
    setTimeout(() => {
      toast.success("Đã khôi phục cài đặt mặc định");
    }, 0);
  }, []); // Empty dependencies array since this function doesn't depend on any props or state

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table
          className="min-w-full bg-white border-separate border-spacing-y-2"
          style={{ borderSpacing: "0 5px" }}
        >
          <thead>
            <tr className="bg-gray-200 text-gray-800 uppercase text-sm leading-normal">
              {/* Type column is always shown */}
              <th className="py-3 px-6 text-left flex items-center">
                Loại
                <button
                  onClick={() => setIsColumnSelectorOpen(true)}
                  className="ml-2 p-1 bg-gray-300 rounded hover:bg-gray-400"
                  aria-label="Chọn cột hiển thị"
                >
                  &#9881;
                </button>
              </th>
              {/* Other columns */}
              {selectedColumns.includes("title") && (
                <th className="py-3 px-6 text-left">Tiêu đề</th>
              )}
              {selectedColumns.includes("description") && (
                <th className="py-3 px-6 text-left hidden md:table-cell">
                  Nội dung
                </th>
              )}
              {selectedColumns.includes("beginTime") && (
                <th className="py-3 px-6 text-left">Ngày bắt đầu</th>
              )}
              {selectedColumns.includes("endTime") && (
                <th className="py-3 px-6 text-left">Ngày Kết thúc</th>
              )}
              {selectedColumns.includes("owner") && (
                <th className="py-3 px-6 text-left">Người sở hữu</th>
              )}
              {selectedColumns.includes("diffLevel") && (
                <th className="py-3 px-6 text-left">Mức độ</th>
              )}
              {selectedColumns.includes("progress") && (
                <th className="py-3 px-6 text-left">Tiến độ</th>
              )}
              <th className="py-3 px-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-sm font-light">
            {listProject.map((item) => (
              <TableRow
                key={item.id}
                item={item}
                handleChange={handleChange}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
                setHistory={setHistory}
                setReloadTableData={setReloadTableData}
                handleUpdateProgress={handleUpdateProgress}
                selectedColumns={selectedColumns}
                openManagers={handleOpenManagers} // Pass handler
                openInviteForm={() => {}} // Add empty function since it's required by interface
              />
            ))}
          </tbody>
        </table>
      </div>

      <ReactModal
        isOpen={isColumnSelectorOpen}
        onRequestClose={() => setIsColumnSelectorOpen(false)}
        style={{
          content: {
            ...modalStyles.content,
            padding: "1.5rem",
            maxWidth: "600px", // Increased from 400px to 600px
            minWidth: "500px", // Add minimum width
          },
          overlay: modalStyles.overlay,
        }}
        contentLabel="Column Selection Modal"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={resetColumnPreferences}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Khôi phục mặc định
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-4">
              {allColumns
                .slice(0, Math.ceil(allColumns.length / 2))
                .map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border border-gray-100"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {col.label}
                    </span>
                    <ColumnToggle
                      enabled={selectedColumns.includes(col.id)}
                      onChange={() => toggleColumn(col.id)}
                    />
                  </div>
                ))}
            </div>

            {/* Right column - same changes as left column */}
            <div className="space-y-4">
              {allColumns.slice(Math.ceil(allColumns.length / 2)).map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border border-gray-100"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {col.label}
                  </span>
                  <ColumnToggle
                    enabled={selectedColumns.includes(col.id)}
                    onChange={() => toggleColumn(col.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReactModal>

      {currentManagerItem && (
        <ManagersModal
          currentManagerItem={currentManagerItem}
          managerPermissions={managerPermissions}
          setManagerPermissions={setManagerPermissions}
          setShowManagers={setShowManagers}
          isOpen={showManagers}
          onClose={() => setShowManagers(false)}
          handleInvite={async (data) => {
            try {
              if (!currentManagerItem) return;

              await apiClient.post("/api/invitation/", {
                ...data,
                project: currentManagerItem.id,
              });

              toast.success("Lời mời đã được gửi thành công!");

              // Refresh managers list
              const response = await apiClient.get<Manager[]>(
                `/api/project/${currentManagerItem.id}/managers_permissions/`
              );
              setManagerPermissions(response.data);
            } catch {
              toast.error("Không thể gửi lời mời. Vui lòng thử lại!");
            }
          }}
        />
      )}

      <div className="p-6 bg-gray-100 flex justify-center">
        <button
          className="p-2 bg-blue-500 text-white border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
          onClick={handleCreateAndSaveItem}
          aria-label={isCreating ? "Save" : "Create"}
        >
          {isCreating ? (
            <FiSave className="w-5 h-5" />
          ) : (
            <FiPlus className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
