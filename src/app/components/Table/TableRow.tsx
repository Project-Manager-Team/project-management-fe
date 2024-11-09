import React from "react";
import {
  FiEdit,
  FiSave,
  FiTrash2,
  FiCheckSquare,
  FiFolder,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Item, TableRowProps } from "@/app/types/table";
import { formatDateTime } from "@/app/utils/formatDateTime";
import { useAppStore } from '@/app/store/appStore';
import OwnerButton from './OwnerButton';

const TableRow: React.FC<TableRowProps> = ({
  item,
  selectedColumns,
  handleChange,
  handleEditItem,
  handleDeleteItem,
  handleUpdateProgress,
  openManagers,
}) => {
  const { history, setHistory, setShouldReloadTable } = useAppStore();

  const dateTimeInputClass = `w-[160px] rounded-lg transition-colors
    ${item.isEditing
      ? "bg-yellow-50 dark:bg-yellow-900 border border-blue-500"
      : "bg-[var(--background)]"
    } focus:outline-none focus:ring-0 text-[var(--foreground)]`;

  // Helper functions
  const handleTypeClick = () => {
    if (item.isEditing) {
      showNavigationConfirm();
      return;
    }
    navigateToChild();
  };

  const showNavigationConfirm = () => {
    const ToastContent = (
      <div>
        <p>Bạn có đang chỉnh sửa nội dung. Bạn có chắc muốn rời đi không?</p>
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss();
              navigateToChild();
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Đồng ý
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-2 py-1 bg-gray-500 text-white rounded"
          >
            Hủy
          </button>
        </div>
      </div>
    );
    
    toast(ToastContent, {
      autoClose: false,
      closeButton: false,
    });
  };

  const navigateToChild = () => {
    const newHistory = [...history, {
      id: item.id,
      url: `/api/project/${item.id}/child`,
      title: item.title || "",
    }];
    setHistory(newHistory);
    setShouldReloadTable(true);
  };

  const renderTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "task":
        return <FiCheckSquare className="w-5 h-5" aria-label="Task" />;
      case "project":
        return <FiFolder className="w-5 h-5" aria-label="Project" />;
      default:
        return <span>{type}</span>;
    }
  };

  const handleCheckboxChange = () => {
    const newProgress = item.progress === 100 ? 0 : 100;
    handleUpdateProgress(item.id, newProgress);
  };

  const getDiffLevelStyle = (level: number | null | undefined) => {
    if (level === null || level === undefined) return "bg-gray-100 text-gray-800";
    switch (level) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      case 3: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDiffLevelText = (level: number | null | undefined) => {
    if (level === null || level === undefined) return "Không xác định";
    switch (level) {
      case 1: return "Dễ";
      case 2: return "Trung bình";
      case 3: return "Khó";
      default: return "Không xác định";
    }
  };

  const onDelete = () => {
    handleDeleteItem(item.id); // Assuming item.id is number | null
  };

  // Render table row
  return (
    <tr className="table-row hover:bg-[var(--muted)]">
      {selectedColumns.includes("type") && (
        <td className="table-cell">
          <button
            className="p-2 bg-[var(--input)] hover:bg-opacity-80 text-[var(--foreground)] 
                     rounded-full transition-all duration-200"
            onClick={handleTypeClick}
          >
            {renderTypeIcon(item.type)}
          </button>
        </td>
      )}
      {selectedColumns.includes("title") && (
        <td className="table-cell">
          <input
            type="text"
            name="title"
            className={`input-field w-full ${
              item.isEditing
                ? "bg-yellow-50 dark:bg-yellow-900 border border-blue-500"
                : "bg-transparent"
            } focus:outline-none focus:ring-0 text-[var(--foreground)] rounded-lg`}
            value={item.title || ""}
            onChange={(e) =>
              handleChange(
                item.index,
                e.target.name as keyof Item,
                e.target.value
              )
            }
            disabled={!item.isEditing}
          />
        </td>
      )}
      {selectedColumns.includes("description") && (
        <td className="table-cell hidden md:table-cell">
          <input
            type="text"
            name="description"
            className={`input-field w-full ${
              item.isEditing
                ? "bg-yellow-50 dark:bg-yellow-900 border border-blue-500"
                : "bg-transparent"
            } focus:outline-none focus:ring-0 text-[var(--foreground)] rounded-lg`}
            value={item.description || ""}
            onChange={(e) =>
              handleChange(
                item.index,
                e.target.name as keyof Item,
                e.target.value
              )
            }
            disabled={!item.isEditing}
          />
        </td>
      )}
      {selectedColumns.includes("beginTime") && (
        <td className="table-cell w-[160px] min-w-[160px]">
          {item.isEditing ? (
            <input
              type="datetime-local"
              name="beginTime"
              className={dateTimeInputClass}
              value={item.beginTime ? item.beginTime.substring(0, 16) : ""}
              onChange={(e) =>
                handleChange(
                  item.index,
                  e.target.name as keyof Item,
                  e.target.value
                )
              }
              disabled={!item.isEditing}
            />
          ) : (
            item.beginTime && (
              <div className="text-[var(--foreground)]">
                <span>{formatDateTime(item.beginTime).time}</span>
                <br />
                <span>{formatDateTime(item.beginTime).date}</span>
              </div>
            )
          )}
        </td>
      )}
      {selectedColumns.includes("endTime") && (
        <td className="table-cell w-[160px] min-w-[160px]"> {/* Thêm width cố định */}
          {item.isEditing ? (
            <input
              type="datetime-local"
              name="endTime"
              className={dateTimeInputClass}
              value={item.endTime ? item.endTime.substring(0, 16) : ""}
              onChange={(e) =>
                handleChange(
                  item.index,
                  e.target.name as keyof Item,
                  e.target.value
                )
              }
              disabled={!item.isEditing}
            />
          ) : (
            item.endTime && (
              <div className="text-[var(--foreground)]">
                <span>{formatDateTime(item.endTime).time}</span>
                <br />
                <span>{formatDateTime(item.endTime).date}</span>
              </div>
            )
          )}
        </td>
      )}
      {selectedColumns.includes("owner") && (
        <td className="table-cell">
          <OwnerButton
            owner={item.owner}
            managersCount={item.managersCount}
            onClick={() => openManagers(item)}
          />
        </td>
      )}
      {selectedColumns.includes("diffLevel") && (
        <td className="table-cell">
          {item.isEditing ? (
            <select
              name="diffLevel"
              className={`input-field w-full ${
                item.isEditing
                  ? "bg-yellow-50 dark:bg-yellow-900 border border-blue-500"
                  : "bg-transparent"
              } focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200 rounded-lg p-2`}
              value={item.diffLevel || ""}
              onChange={(e) =>
                handleChange(
                  item.index,
                  e.target.name as keyof Item,
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              disabled={!item.isEditing}
            >
              <option value="">Chọn mức độ</option>
              <option value="1">Dễ</option>
              <option value="2">Trung bình</option>
              <option value="3">Khó</option>
            </select>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-sm ${getDiffLevelStyle(
                item.diffLevel
              )}`}
            >
              {getDiffLevelText(item.diffLevel)}
            </span>
          )}
        </td>
      )}
      {selectedColumns.includes("progress") && (
        <td className="table-cell">
          {item.type.toLowerCase() === "task" ? (
            <input
              type="checkbox"
              checked={item.progress === 100}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-green-600"
              aria-label="Mark as complete"
            />
          ) : (
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${item.progress}%` }}
                aria-label={`Progress: ${item.progress}%`}
              ></div>
            </div>
          )}
        </td>
      )}
      <td className="table-cell text-right w-[80px] min-w-[80px]">
        <div className="flex space-x-1">
          <button
            className="p-1.5 bg-[var(--muted)] hover:bg-[var(--muted-foreground)]
                      text-[var(--foreground)] rounded-full transition-all"
            onClick={() => handleEditItem(item.index)}
            aria-label={item.isEditing ? "Save" : "Edit"}
          >
            {item.isEditing ? <FiSave className="w-4 h-4" /> : <FiEdit className="w-4 h-4" />}
          </button>
          <button
            className="p-1.5 bg-[var(--muted)] hover:bg-[var(--muted-foreground)]
                      text-[var(--foreground)] rounded-full transition-all"
            onClick={onDelete}
            aria-label="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TableRow;