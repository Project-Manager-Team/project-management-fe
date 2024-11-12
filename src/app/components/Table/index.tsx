"use client";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/app/utils/apiClient";
import { toast } from "react-toastify";
import {
  Item,
  Manager,
  ColumnToggleProps,
} from "@/app/components/Table/types/table";
import { FiPlus, FiSave, FiArrowLeft } from "react-icons/fi"; // Add this import
import ManagersModal from "./ManagersModal";
import ReactModal from "react-modal";
import { Switch, Dialog } from "@headlessui/react"; // Add this import
import { useAppStore } from "@/app/store/appStore"; // Add this import
import CardView from "./CardView";
import {
  DEFAULT_COLUMNS,
  allColumns,
} from "@/app/components/Table/constants/columns";
import TableView from "./TableView"; // Thêm import cho TableView
import { useProject } from "./hooks/useProject";

// Add this after imports
ReactModal.setAppElement("body"); // Set the root element for accessibility

// Thêm VIEW_MODE_KEY vào cùng với STORAGE_KEY
const STORAGE_KEY = "table-column-preferences";
const VIEW_MODE_KEY = "table-view-mode";

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

// Cập nhật interface TableProps
interface TableProps {
  current: {
    id: number;
    url: string;
    title: string;
  };
}

export default function Table({ current }: TableProps) {
  const { history, setHistory, setShouldReloadTable } = useAppStore();
  const {
    listProject,
    isCreating,
    setIsCreating, // Add this
    hasUnsavedChanges,
    handleChange,
    handleEditItem,
    handleDeleteItem,
    handleCreateAndSaveItem,
    handleUpdateProgress,
  } = useProject(current.id, current.url);

  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(DEFAULT_COLUMNS);
  const [viewMode, setViewMode] = useState<"table" | "card">(() => {
    // Lấy chế độ hiển thị từ localStorage khi khởi tạo
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(VIEW_MODE_KEY);
      return savedMode === "table" || savedMode === "card"
        ? savedMode
        : "table";
    }
    return "table";
  });

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

  // Add this effect to handle navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Add this effect to save changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedColumns));
    }
  }, [selectedColumns]);

  // Thêm effect để lưu viewMode vào localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    }
  }, [viewMode]);

  // Modify the resetColumnPreferences function to use setTimeout for toast
  const resetColumnPreferences = useCallback(() => {
    setSelectedColumns(DEFAULT_COLUMNS);
    setTimeout(() => {
      toast.success("Đã khôi phục cài đặt mặc định");
    }, 0);
  }, []); // Empty dependencies array since this function doesn't depend on any props or state

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      toast.warning("Vui lòng lưu thay đổi trước khi quay lại!");
      return;
    }

    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    setShouldReloadTable(true);
  };

  return (
    <div className="bg-[var(--card)] shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center">
        <div className="flex items-center gap-4 flex-shrink-0">
          {history.length > 1 && (
            <button
              onClick={handleBack}
              className="p-2 bg-[var(--muted)] hover:bg-[var(--muted-foreground)] 
                        rounded transition-colors duration-200 flex items-center gap-2
                        text-[var(--foreground)]"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex gap-2 p-1 bg-[var(--muted)] rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-2
                        ${
                          viewMode === "table"
                            ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
              disabled={viewMode === "table"}
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
                  d="M3 10h18M3 14h18M3 18h18M3 6h18"
                />
              </svg>
            </button>

            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-2
                        ${
                          viewMode === "card"
                            ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
              disabled={viewMode === "card"}
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Center title */}
        <div className="flex-1 px-4 text-center">
          <h1 className="text-lg font-medium text-[var(--foreground)] truncate">
            {current.title}
          </h1>
        </div>

        {/* Right section */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsColumnSelectorOpen(true)}
            className="p-2 bg-[var(--muted)] hover:bg-[var(--muted-foreground)] 
                      rounded transition-colors duration-200"
          >
            <span className="sr-only">Mở cài đặt</span>
            ⚙️
          </button>
        </div>
      </div>

      {/* View content */}
      {viewMode === "table" ? (
        <TableView
          items={listProject}
          selectedColumns={selectedColumns}
          handleChange={handleChange} // Now matches the expected signature
          handleEditItem={handleEditItem}
          handleDeleteItem={handleDeleteItem}
          handleUpdateProgress={handleUpdateProgress}
          openManagers={handleOpenManagers}
          isCreating={isCreating} // Pass isCreating to TableView
          setIsCreating={setIsCreating}
          parentTitle={current.title} // Add this prop
        />
      ) : (
        <CardView
          items={listProject}
          handleChange={handleChange}
          handleEditItem={handleEditItem}
          handleDeleteItem={handleDeleteItem}
          handleUpdateProgress={handleUpdateProgress}
          openManagers={handleOpenManagers}
          isCreating={isCreating} // Pass isCreating to CardView
          setIsCreating={setIsCreating}
        />
      )}

      {/* Column Selection Modal */}
      <Dialog
        open={isColumnSelectorOpen}
        onClose={() => setIsColumnSelectorOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-[var(--background)] p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium mb-4 text-[var(--foreground)]">
              Cài đặt hiển thị cột
            </Dialog.Title>

            <div className="space-y-6">
              {/* Xóa phần View Mode ở đây */}

              {/* Column Toggles */}
              <div className="space-y-2">
                {/* Column header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[var(--foreground)]">
                    Cột hiển thị
                  </h3>
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
                    Mặc định
                  </button>
                </div>

                {/* Column toggles */}
                {allColumns.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-3
                             bg-[var(--input)] hover:bg-[var(--muted)]
                             rounded-lg transition-colors"
                  >
                    <span className="text-[var(--foreground)]">
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
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Managers Modal */}
      {currentManagerItem && (
        <ManagersModal
          currentManagerItem={currentManagerItem}
          managerPermissions={managerPermissions}
          setManagerPermissions={setManagerPermissions}
          isOpen={showManagers}
          onClose={() => setShowManagers(false)}
        />
      )}

      {/* Create/Save Button */}
      <div className="p-6 bg-[var(--input)] flex justify-center">
        <button
          className="p-2 bg-blue-500 dark:bg-blue-600 text-white border-none rounded-full cursor-pointer 
                    shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 
                    flex items-center justify-center"
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
