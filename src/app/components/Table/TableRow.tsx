import React from "react";
import {
  FiEdit,
  FiSave,
  FiTrash2,
  FiCheckSquare,
  FiFolder,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Image from "next/image";
import { DOMAIN } from "@/app/config/api";
import { ManagerButton } from "./ManagerButton";
import { TableRowProps } from "@/app/types/table";
import { Item } from "@/app/types/table";
import { formatDateTime } from "@/app/utils/formatDateTime";
import { useAppStore } from '@/app/store/appStore'; // Add this import

const TableRow: React.FC<TableRowProps> = ({
  item,
  handleChange,
  handleEditItem,
  handleDeleteItem,
  handleUpdateProgress,
  selectedColumns,
  openManagers,
}) => {
  const { history, setHistory, setShouldReloadTable } = useAppStore(); // Add history

  const handleTypeClick = () => {
    const newHistory = [...history, {
      id: item.id,
      url: `/api/project/${item.id}/child`,
      title: item.title || "",
    }];
    setHistory(newHistory); // Pass the new array directly
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

  // Cập nhật helper functions với type safety
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

  return (
    <tr
      key={`main-row-${item.id}`}
      className="
        group transition-colors duration-300 rounded-lg 
        transform hover:-translate-y-[3px] hover:shadow-md
        bg-white text-black
      "
    >
      {selectedColumns.includes("type") && (
        <td className="py-3 px-6 text-left bg-transparent">
          <button
            className="p-2 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center"
            onClick={handleTypeClick}
            aria-label={item.type}
          >
            {renderTypeIcon(item.type)}
          </button>
        </td>
      )}
      {selectedColumns.includes("title") && (
        <td className="py-3 px-6 text-left bg-transparent">
          <input
            type="text"
            name="title"
            className={`w-full ${
              item.isEditing
                ? "bg-yellow-50 border border-blue-500"
                : "bg-transparent"
            } focus:outline-none focus:ring-0 text-black rounded-lg`}
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
        <td className="py-3 px-6 text-left bg-white rounded-lg hidden md:table-cell">
          <input
            type="text"
            name="description"
            className={`w-full ${
              item.isEditing
                ? "bg-yellow-50 border border-blue-500"
                : "bg-transparent"
            } focus:outline-none focus:ring-0 text-black rounded-lg`}
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
        <td className="py-3 px-6 text-left bg-white rounded-lg">
          {item.isEditing ? (
            <input
              type="datetime-local"
              name="beginTime"
              className={`w-full ${
                item.isEditing
                  ? "bg-yellow-50 border border-blue-500"
                  : "bg-transparent"
              } focus:outline-none focus:ring-0 text-black rounded-lg`}
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
              <div>
                <span>{formatDateTime(item.beginTime).time}</span>
                <br />
                <span>{formatDateTime(item.beginTime).date}</span>
              </div>
            )
          )}
        </td>
      )}
      {selectedColumns.includes("endTime") && (
        <td className="py-3 px-6 text-left bg-white rounded-lg">
          {item.isEditing ? (
            <input
              type="datetime-local"
              name="endTime"
              className={`w-full ${
                item.isEditing
                  ? "bg-yellow-50 border border-blue-500"
                  : "bg-transparent"
              } focus:outline-none focus:ring-0 text-black rounded-lg`}
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
              <div>
                <span>{formatDateTime(item.endTime).time}</span>
                <br />
                <span>{formatDateTime(item.endTime).date}</span>
              </div>
            )
          )}
        </td>
      )}
      {selectedColumns.includes("owner") && (
        <td className="py-3 px-6 text-left bg-white rounded-lg">
          {item.owner ? (
            <div className="relative group">
              {item.owner.avatar ? (
                <Image
                  src={
                    item.owner.avatar.startsWith("http")
                      ? item.owner.avatar
                      : `${DOMAIN}${item.owner.avatar}`
                  }
                  alt={item.owner.username}
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer"
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>
                  ) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
              ) : (
                <FiUser className="w-8 h-8 text-gray-500 cursor-pointer" />
              )}
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.owner.username}
              </span>
            </div>
          ) : (
            <span>Không có</span>
          )}
        </td>
      )}
      {selectedColumns.includes("diffLevel") && (
        <td className="py-3 px-6 text-left bg-white rounded-lg">
          {item.isEditing ? (
            <select
              name="diffLevel"
              className={`w-full ${
                item.isEditing
                  ? "bg-yellow-50 border border-blue-500"
                  : "bg-transparent"
              } focus:outline-none focus:ring-0 text-black rounded-lg p-2`}
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
        <td className="py-3 px-6 text-left bg-white rounded-lg">
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
      <td className="py-3 px-2 text-right w-[120px] min-w-[120px]"> {/* Thay đổi padding và thêm width cố định */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1"> {/* Giảm space-x-2 thành space-x-1 */}
          <button
            className="p-1.5 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer shadow-sm hover:bg-gray-300 flex items-center justify-center" 
            // Giảm padding và shadow
            onClick={() => {
              if (item.title && item.title.trim() === "") {
                toast.error("Title is required");
              } else {
                handleEditItem(item.index);
              }
            }}
            aria-label={item.isEditing ? "Save" : "Edit"}
          >
            {item.isEditing ? (
              <FiSave className="w-4 h-4" /> // Giảm kích thước icon
            ) : (
              <FiEdit className="w-4 h-4" />
            )}
          </button>
          <button
            className="p-1.5 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer shadow-sm hover:bg-gray-300 flex items-center justify-center"
            onClick={() => handleDeleteItem(item.id)}
            aria-label="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
          <ManagerButton
            onClick={() => openManagers(item)}
            managersCount={item.managersCount}
            size="small" // Thêm prop size
          />
        </div>
      </td>
    </tr>
  );
};

export default TableRow;