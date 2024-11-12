"use client";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/app/utils/apiClient";
import { toast } from "react-toastify";
import {
  Item,
  ItemProperty,
  Manager,
  ColumnToggleProps,
} from "@/app/types/table";
import { FiPlus, FiSave, FiArrowLeft } from "react-icons/fi"; // Add this import
import ManagersModal from "./ManagersModal";
import ReactModal from "react-modal";
import { Switch, Dialog } from "@headlessui/react"; // Add this import
import { useAppStore } from '@/app/store/appStore'; // Add this import
import CardView from './CardView';
import {DEFAULT_COLUMNS, allColumns } from '@/app/constants/columns';
import TableView from './TableView'; // Thêm import cho TableView
import { showConfirmationToast } from "@/app/utils/toastUtils";

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
  const { history, setHistory, shouldReloadTable, setShouldReloadTable } = useAppStore();
  
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [listProject, setListProject] = useState<Item[]>([]);
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(DEFAULT_COLUMNS);
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    // Lấy chế độ hiển thị từ localStorage khi khởi tạo
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(VIEW_MODE_KEY);
      return (savedMode === 'table' || savedMode === 'card') ? savedMode : 'table';
    }
    return 'table';
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

  // Add this new function to update indexes
  const updateIndexes = (items: Item[]) => {
    return items.map((item, index) => ({
      ...item,
      index
    }));
  };

  const handleDeleteItem = useCallback((id: number | null) => {
    if (id === null) {
      toast.error("ID không hợp lệ");
      return;
    }
  
    // Kiểm tra nếu có item khác đang được chỉnh sửa
    const hasOtherEditingItems = listProject.some(item => 
      item.id !== id && (item.isEditing || isCreating)
    );
  
    if (hasOtherEditingItems) {
      toast.warning("Vui lòng lưu các thay đổi trước khi xóa!");
      return;
    }
  
    const itemToDelete = listProject.find((item) => item.id === id);
    const isNewItem =
      isCreating &&
      itemToDelete &&
      itemToDelete.id === listProject[listProject.length - 1].id;
  
    const confirmDelete = () => {
      if (isNewItem) {
        setListProject((prevList) => {
          const filteredList = prevList.filter((item) => item.id !== id);
          return updateIndexes(filteredList);
        });
        setIsCreating(false);
        toast.success("Đã xoá nhiệm vụ mới tạo!");
      } else {
        apiClient
          .delete(`/api/project/${id}/`)
          .then(() => {
            setListProject((prevList) => {
              const filteredList = prevList.filter((item) => item.id !== id);
              return updateIndexes(filteredList);
            });
            toast.success("Xóa nhiệm vụ thành công!");
          })
          .catch(() => {
            toast.error("Không thể xóa nhiệm vụ");
          });
      }
    };
  
    showConfirmationToast("Bạn có muốn xóa không?", confirmDelete);
  }, [listProject, isCreating]);

  // Add this function to check if any item is being edited
  const hasUnsavedChanges = useCallback(() => {
    return isCreating || listProject.some(item => item.isEditing);
  }, [isCreating, listProject]);

  // Add this effect to handle navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Update getProjects to pass a callback function
  const getProjects = async (url: string, onConfirm?: () => void) => {
    if (!url) {
      console.warn('No URL provided to getProjects');
      return;
    }
  
    if (hasUnsavedChanges()) {
      showConfirmationToast(
        "Bạn có đang chỉnh sửa nội dung. Bạn có chắc muốn rời đi không?",
        () => {
          getProjectsData(url);
          if (onConfirm) onConfirm();
        }
      );
      return;
    }
  
    getProjectsData(url);
    if (onConfirm) onConfirm();
  };

  // Separate data fetching logic
  const getProjectsData = async (url: string) => {
    try {
      setIsCreating(false); // Reset isCreating trước khi fetch data mới
      // Kiểm tra access token trước khi gọi API
      const accessToken = sessionStorage.getItem('access');
      if (!accessToken) {
        setListProject([]); // Xóa dữ liệu bảng nếu không có token
        return;
      }

      const { data } = await apiClient.get<Item[]>(url);
      const newData = data.filter((item) => item.type !== "personal");
      const indexedData = updateIndexes(newData.map(item => ({
        ...item,
        isEditing: false
      })));
      setListProject(indexedData);
    } catch {
      setListProject([]); // Xóa dữ liệu bảng nếu có lỗi
      toast.error("Lấy dữ liệu không thành công");
    } finally {
      setShouldReloadTable(false); // Reset reloadTableData after fetching
    }
  };

  useEffect(() => {
    if (current?.url) {
      getProjects(current.url);
    }
  }, [current?.url, shouldReloadTable]);

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
        diffLevel: 1, // Set default difficulty to 1 (easy)
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
        await apiClient.post<Item>("/api/project/", newItem); // Ensure correct API path
        // Cập nhật state trước khi gọi getProjects
        setIsCreating(false);
        // Gọi getProjects trực tiếp không cần confirm
        await getProjectsData(current.url);
        toast.success("Tạo mới nhiệm vụ thành công!");
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

  // Thêm effect để lưu viewMode vào localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
      {/* Header với các nút điều khiển */}
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Back Button */}
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
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors flex items-center justify-center gap-2
                        ${viewMode === 'table' 
                          ? 'bg-[var(--muted)] text-[var(--muted-foreground)]' 
                          : 'bg-[var(--primary)] text-white hover:bg-[var(--primary)/90]'}`}
              disabled={viewMode === 'table'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 10h18M3 14h18M3 18h18M3 6h18" />
              </svg>
            </button>
            
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded transition-colors flex items-center justify-center gap-2
                        ${viewMode === 'card' 
                          ? 'bg-[var(--muted)] text-[var(--muted-foreground)]' 
                          : 'bg-[var(--primary)] text-white hover:bg-[var(--primary)/90]'}`}
              disabled={viewMode === 'card'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setIsColumnSelectorOpen(true)}
          className="p-2 bg-[var(--muted)] hover:bg-[var(--muted-foreground)] 
                    rounded transition-colors duration-200"
        >
          <span className="sr-only">Mở cài đặt</span>
          ⚙️
        </button>
      </div>

      {/* View content */}
      {viewMode === 'table' ? (
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
                    <span className="text-[var(--foreground)]">{col.label}</span>
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
          {isCreating ? <FiSave className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
