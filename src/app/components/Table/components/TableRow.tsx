import React from "react";
import {
  FiEdit,
  FiSave,
  FiTrash2,
  FiCheckSquare,
  FiFolder,
} from "react-icons/fi";
import { Item, TableRowProps } from "@/app/components/Table/types/table";
import { formatDateTime } from "@/app/utils/formatDateTime";
import { useAppStore } from "@/app/store/appStore";
import { toast } from "react-toastify";
import OwnerButton from "./OwnerButton";
import EditableContent from '@/app/components/common/EditableContent';

const TableRow: React.FC<TableRowProps> = ({
  item,
  handleChange,
  handleEditItem,
  handleDeleteItem,
  handleUpdateProgress,
  openManagers,
  selectedColumns,
  isCreating,
  setIsCreating,
}) => {
  const { history, setHistory, setShouldReloadTable } = useAppStore();

  const dateTimeInputClass = `w-[160px] rounded-lg transition-colors
    ${
      item.isEditing
        ? "bg-yellow-50 dark:bg-yellow-900 border border-blue-500"
        : "bg-[var(--background)]"
    } focus:outline-none focus:ring-0 text-[var(--foreground)]`;

  // Helper functions
  const handleTypeClick = () => {
    if (item.isEditing || isCreating) {
      toast.warning("Vui lòng lưu thay đổi trước khi chuyển trang!");
      return;
    }
    navigateToChild();
  };

  const navigateToChild = () => {
    setIsCreating(false); // Reset isCreating state
    const newHistory = [
      ...history,
      {
        id: item.id,
        url: `/api/project/${item.id}/child`,
        title: item.title || "",
      },
    ];
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
    if (level === null || level === undefined)
      return "bg-gray-100 text-gray-800";
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDiffLevelText = (level: number | null | undefined) => {
    if (level === null || level === undefined) return "Không xác định";
    switch (level) {
      case 1:
        return "Dễ";
      case 2:
        return "Trung bình";
      case 3:
        return "Khó";
      default:
        return "Không xác định";
    }
  };

  const onDelete = () => {
    handleDeleteItem(item.id); // Assuming item.id is number | null
  };

  // Render table row
  return (
    <tr className="hover:bg-[var(--muted)] border-b border-[var(--border)]">
      {/* Type column is always shown */}
      <td className="p-3 align-middle">
        <button
          className="p-2 bg-[var(--input)] hover:bg-opacity-80 text-[var(--foreground)] 
                   rounded-full transition-all duration-200"
          onClick={handleTypeClick}
        >
          {renderTypeIcon(item.type)}
        </button>
      </td>
      {/* Other columns are toggleable */}
      {selectedColumns.map((colId) => {
        switch (colId) {
          case "title":
            return (
              <td key={colId} className="p-3 align-middle max-w-[200px]"> {/* Changed from min-w to max-w */}
                <div className="overflow-hidden">
                  <EditableContent
                    isEditing={item.isEditing}
                    value={item.title}
                    name="title"
                    onChange={(e) => handleChange(item.index, "title" as keyof Item, e.target.value)}
                    className="w-full text-sm rounded-lg truncate" // Added truncate
                  />
                </div>
              </td>
            );
          case "description":
            return (
              <td key={colId} className="p-3 align-middle hidden md:table-cell max-w-[300px]"> {/* Added max-w */}
                <div className="overflow-hidden">
                  <EditableContent
                    isEditing={item.isEditing}
                    value={item.description}
                    name="description"
                    onChange={(e) => handleChange(item.index, "description" as keyof Item, e.target.value)}
                    className="w-full rounded-lg line-clamp-2" // Added line-clamp-2 for 2 lines max
                  />
                </div>
              </td>
            );
          case "beginTime":
            return (
              <td
                key={colId}
                className="p-3 align-middle w-[160px] min-w-[160px]"
              >
                {item.isEditing ? (
                  <EditableContent
                    isEditing={true}
                    value={item.beginTime ? item.beginTime.substring(0, 16) : ""}
                    name="beginTime"
                    type="datetime-local"
                    onChange={(e) => handleChange(item.index, "beginTime" as keyof Item, e.target.value)}
                    className={dateTimeInputClass}
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
            );
          case "endTime":
            return (
              <td
                key={colId}
                className="p-3 align-middle w-[160px] min-w-[160px]"
              >
                {item.isEditing ? (
                  <EditableContent
                    isEditing={true}
                    value={item.endTime ? item.endTime.substring(0, 16) : ""}
                    name="endTime"
                    type="datetime-local"
                    onChange={(e) => handleChange(item.index, "endTime" as keyof Item, e.target.value)}
                    className={dateTimeInputClass}
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
            );
          case "owner":
            return (
              <td key={colId} className="p-3 align-middle">
                <OwnerButton
                  owner={item.owner}
                  managersCount={item.managersCount}
                  onClick={() => openManagers(item)}
                />
              </td>
            );
          case "diffLevel":
            return (
              <td key={colId} className="p-3 align-middle">
                {item.isEditing ? (
                  <select
                    name="diffLevel"
                    className={`input-field w-full ${
                      item.isEditing
                        ? "bg-yellow-50 dark:bg-yellow-900 border border-blue-500"
                        : "bg-transparent"
                    } focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200 rounded-lg p-2`}
                    value={item.diffLevel === null ? "1" : item.diffLevel}
                    onChange={(e) =>
                      handleChange(
                        item.index,
                        e.target.name as keyof Item,
                        e.target.value ? parseInt(e.target.value) : 1
                      )
                    }
                    disabled={!item.isEditing}
                  >
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
            );
          case "progress":
            return (
              <td key={colId} className="p-3 align-middle">
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
            );
          default:
            return null;
        }
      })}
      <td className="p-3 align-middle text-right whitespace-nowrap">
        <div className="flex justify-end space-x-1">
          <button
            className="p-1.5 bg-[var(--muted)] hover:bg-[var(--muted-foreground)]
                      text-[var(--foreground)] rounded-full transition-all"
            onClick={() => handleEditItem(item.index)}
            aria-label={item.isEditing ? "Save" : "Edit"}
          >
            {item.isEditing ? (
              <FiSave className="w-4 h-4" />
            ) : (
              <FiEdit className="w-4 h-4" />
            )}
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
