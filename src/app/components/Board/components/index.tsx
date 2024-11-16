"use client";
import { useState, useEffect, useCallback } from "react"; // Add useRef
import { toast } from "react-toastify";
import {
  Item,
  ColumnToggleProps,
  Manager,
} from "@/app/components/Board/types/board";
import { FiPlus, FiSave, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi"; // Add these imports
import ManagersModal from "./ManagersModal";
import ReactModal from "react-modal";
import { Switch, Dialog } from "@headlessui/react"; // Add this import
import { useAppStore } from "@/app/store/appStore"; // Add this import
import CardView from "./CardView";
import TreeProject from "./TreeProject";
import {
  DEFAULT_COLUMNS,
  allColumns,
} from "@/app/components/Board/constants/columns";
import TableView from "./TableView"; // Thêm import cho BoardView
import { useProject } from "../hooks/useProject";
import ContextMenu from "./ContextMenu"; // Add this import

// Add this after imports
ReactModal.setAppElement("body"); // Set the root element for accessibility

// Thêm VIEW_MODE_KEY vào cùng với STORAGE_KEY
const STORAGE_KEY = "Board-column-preferences";
const VIEW_MODE_KEY = "Board-view-mode";

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

// Cập nhật interface BoardProps
interface BoardProps {
  current?: {
    id: number | null;
    url: string;
    title: string;
  };
}

const defaultCurrent = {
  id: 0,
  url: "/api/project/personal/",
  title: "Root",
};

export default function Board({ current = defaultCurrent }: BoardProps) {
  const { history, setHistory, setShouldReloadBoard } = useAppStore();
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
    handleNavigateToChild, // Add this
    handleColorChange, // Thêm handler này
    handleGenerateReport, // Add this
  } = useProject(current.id ?? 0, current.url);

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
  const [managerPermissions, setManagerPermissions] = useState<Manager[]>([]); // Add this line

  const handleOpenManagers = (item: Item) => {
    setCurrentManagerItem(item);
    setShowManagers(true);
  };

  const toggleColumn = useCallback((columnId: string) => {
    setSelectedColumns((prev) => {
      const isRemoving = prev.includes(columnId);
      if (isRemoving && prev.length <= 1) {
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
  }, []);

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

    setShouldReloadBoard(true); // Only set this when necessary
  };

  useEffect(() => {
    // Set shouldReloadBoard to true only when history changes
    if (history.length > 0) {
      setShouldReloadBoard(true);
    }
  }, [history, setShouldReloadBoard]);

  const [isTreeVisible, setIsTreeVisible] = useState(true); // Add this state

  const [contextMenu, setContextMenu] = useState<{
    item: Item;
    position: { x: number; y: number };
  } | null>(null);

  return (
    <div className="relative min-h-screen flex bg-[var(--background)]">
      {/* Tree section with seamless styling */}
      <div
        className={`transition-all duration-300 ease-in-out border-r border-[var(--border)]
                    ${isTreeVisible ? "w-64" : "w-0"} overflow-hidden`}
      >
        {isTreeVisible && <TreeProject />}
      </div>

      {/* Main content section */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-4">
          <div className="bg-[var(--card)] rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border)] flex items-center">
              <div className="flex items-center gap-4 flex-shrink-0">
                <button
                  onClick={() => setIsTreeVisible(!isTreeVisible)} // Toggle visibility
                  className="p-2 bg-[var(--muted)] hover:bg-[var(--muted-foreground)] 
                          rounded transition-colors duration-200 flex items-center gap-2
                          text-[var(--foreground)]"
                >
                  {isTreeVisible ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
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
                openManagers={handleOpenManagers} // Add this
                isCreating={isCreating} // Pass isCreating to BoardView
                setIsCreating={setIsCreating}
                parentTitle={current.title} // Add this prop
                handleNavigateToChild={handleNavigateToChild} // Add this
                handleColorChange={handleColorChange} // Thêm prop này
                handleGenerateReport={handleGenerateReport} // Add this
                setContextMenu={setContextMenu} // Add this
              />
            ) : (
              <CardView
                items={listProject}
                handleChange={handleChange}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
                handleUpdateProgress={handleUpdateProgress}
                openManagers={handleOpenManagers} // Add this
                isCreating={isCreating} // Pass isCreating to CardView
                setIsCreating={setIsCreating}
                handleNavigateToChild={handleNavigateToChild} // Add this
                handleColorChange={handleColorChange} // Thêm prop này
                handleGenerateReport={handleGenerateReport} // Add this
                setContextMenu={setContextMenu} // Add this
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
                    <div className="space-y-2">
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

            {currentManagerItem && (
              <ManagersModal
                currentManagerItem={currentManagerItem}
                isOpen={showManagers}
                onClose={() => setShowManagers(false)}
                managerPermissions={managerPermissions}
                setManagerPermissions={setManagerPermissions}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="p-3 bg-blue-500 dark:bg-blue-600 text-white rounded-full cursor-pointer 
                        shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          onClick={handleCreateAndSaveItem}
          aria-label={isCreating ? "Save" : "Create"}
        >
          {isCreating ? (
            <FiSave className="w-6 h-6" />
          ) : (
            <FiPlus className="w-6 h-6" />
          )}
        </button>
      </div>

      {contextMenu && (
        <ContextMenu
          item={contextMenu.item}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onEdit={() => {
            handleEditItem(contextMenu.item.index);
            setContextMenu(null);
          }}
          onDelete={() => {
            handleDeleteItem(contextMenu.item.id);
            setContextMenu(null);
          }}
          onManage={() => {
            handleOpenManagers(contextMenu.item); // Corrected function name
            setContextMenu(null);
          }}
          onColorChange={(color) => {
            handleColorChange(contextMenu.item.index, color);
            setContextMenu(null);
          }}
          onGenerateReport={() => {
            handleGenerateReport(contextMenu.item);
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
}
