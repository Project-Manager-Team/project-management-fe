import React, { memo, useState, useEffect, useRef } from "react";
import { Item, HistoryItem } from "../interfaces";
import {
  FiEdit,
  FiSave,
  FiTrash2,
  FiCheckSquare,
  FiFolder,
  FiUserPlus,
} from "react-icons/fi";
import apiClient from "@/utils";
import { toast } from "react-toastify";

interface TableRowProps {
  item: Item;
  managerNames: string[]; // Added managerNames
  handleChange: (
    index: number,
    name: string,
    value: string | number | boolean | null
  ) => void;
  handleEditItem: (index: number) => void;
  handleDeleteItem: (id: number | null) => void;
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  setReloadTableData: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateProgress: (id: number, progress: number) => void;
  // Removed handleAddManager
}

const TableRow: React.FC<TableRowProps> = ({
  item,
  managerNames, // Destructure managerNames
  handleChange,
  handleEditItem,
  handleDeleteItem,
  setHistory,
  setReloadTableData,
  handleUpdateProgress,
  // Removed handleAddManager
}) => {
  const [showInviteForm, setShowInviteForm] = useState<boolean>(false);
  const [inviteUsername, setInviteUsername] = useState<string>("");
  const [inviteTitle, setInviteTitle] = useState<string>("");
  const [inviteContent, setInviteContent] = useState<string>("");

  const inviteFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showInviteForm &&
        inviteFormRef.current &&
        !inviteFormRef.current.contains(event.target as Node)
      ) {
        setShowInviteForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInviteForm]);

  const handleTypeClick = () => {
    setHistory((prevHistory: HistoryItem[]) => [
      ...prevHistory,
      {
        id: item.id,
        url: `/project/${item.id}/child`,
        title: item.title || "",
      },
    ]);
    setReloadTableData((prev) => !prev);
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

  const handleInvite = async () => {
    try {
      await apiClient.post("/invitation/", {
        username: inviteUsername,
        title: inviteTitle,
        content: inviteContent,
        project: item.id,
      });
      setShowInviteForm(false);
      setInviteUsername("");
      setInviteTitle("");
      setInviteContent("");
      toast.success("Lời mời đã được gửi thành công!");
    } catch {
      toast.error("Không thể gửi lời mời");
    }
  };

  // Calculate the number of columns in your table
  const columnCount = 8; // Adjust this number based on your table columns

  // Utility function to format datetime
  const formatDateTime = (datetime: string): { time: string; date: string } => {
    const dateObj = new Date(datetime);
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = dateObj.toLocaleDateString();
    return { time, date };
  };

  return (
    <>
      <tr
        className="
          group transition-colors duration-300 rounded-lg 
          transform hover:-translate-y-[3px] hover:shadow-md
          bg-white text-black
        "
      >
        <td className="py-3 px-6 text-left bg-transparent">
          <button
            className="p-2 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center"
            onClick={handleTypeClick}
            aria-label={item.type}
          >
            {renderTypeIcon(item.type)}
          </button>
        </td>{/* */}
        <td className="py-3 px-6 text-left bg-transparent">
          <input
            type="text"
            name="title"
            className="w-full bg-transparent focus:outline-none focus:ring-0 text-black rounded-lg"
            value={item.title || ""}
            onChange={(e) =>
              handleChange(item.index, e.target.name, e.target.value)
            }
            disabled={!item.isEditing}
          />
        </td>{/* */}
        <td className="py-3 px-6 text-left bg-white rounded-lg hidden md:table-cell">
          <input
            type="text"
            name="description"
            className="w-full bg-transparent focus:outline-none focus:ring-0 text-black rounded-lg"
            value={item.description || ""}
            onChange={(e) =>
              handleChange(item.index, e.target.name, e.target.value)
            }
            disabled={!item.isEditing}
          />
        </td>{/* */}
        <td className="py-3 px-6 text-left bg-white rounded-lg">
          {item.isEditing ? (
            <input
              type="datetime-local"
              name="beginTime"
              className="w-full bg-transparent focus:outline-none focus:ring-0 text-black rounded-lg"
              value={item.beginTime ? item.beginTime.substring(0, 16) : ""}
              onChange={(e) =>
                handleChange(item.index, e.target.name, e.target.value)
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
        </td>{/* */}
        <td className="py-3 px-6 text-left bg-white rounded-lg">
          {item.isEditing ? (
            <input
              type="datetime-local"
              name="endTime"
              className="w-full bg-transparent focus:outline-none focus:ring-0 text-black rounded-lg"
              value={item.endTime ? item.endTime.substring(0, 16) : ""}
              onChange={(e) =>
                handleChange(item.index, e.target.name, e.target.value)
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
        </td>{/* */}
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
        </td>{/* */}
        <td className="py-3 px-6 text-left bg-white rounded-lg">
          {managerNames.join(", ")}
          {/* Removed the Add Manager button */}
        </td>
        <td className="py-3 px-6 text-left hidden lg:table-cell">
          <button
            className="p-2 bg-blue-500 text-white border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
            onClick={() => setShowInviteForm(!showInviteForm)}
            aria-label="Invite"
          >
            <FiUserPlus className="w-5 h-5" />
          </button>
        </td>{/* */}
        <td className="py-3 px-6 text-right">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <button
              className="p-2 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
              onClick={() => handleEditItem(item.index)}
              aria-label={item.isEditing ? "Save" : "Edit"}
            >
              {item.isEditing ? (
                <FiSave className="w-5 h-5" />
              ) : (
                <FiEdit className="w-5 h-5" />
              )}
            </button>
            <button
              className="p-2 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
              onClick={() => handleDeleteItem(item.id)}
              aria-label="Delete"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
      {showInviteForm && (
        <tr>
          <td colSpan={columnCount}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div
                ref={inviteFormRef}
                className="bg-white p-4 rounded-lg shadow-lg z-60 max-w-md w-full mx-4"
              >
                <h3 className="text-lg font-semibold mb-2">Tạo lời mời</h3>
                <input
                  type="text"
                  placeholder="Username"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  className="w-full mb-2 p-2 border rounded"
                />
                <textarea
                  placeholder="Content"
                  value={inviteContent}
                  onChange={(e) => setInviteContent(e.target.value)}
                  className="w-full mb-2 p-2 border rounded"
                />
                <button
                  onClick={handleInvite}
                  className="w-full bg-green-500 text-white p-2 rounded mt-2"
                >
                  Gửi lời mời
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default memo(TableRow, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.index === nextProps.item.index &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.description === nextProps.item.description &&
    prevProps.item.beginTime === nextProps.item.beginTime &&
    prevProps.item.endTime === nextProps.item.endTime &&
    prevProps.item.progress === nextProps.item.progress &&
    prevProps.item.manager === nextProps.item.manager &&
    prevProps.item.isEditing === nextProps.item.isEditing &&
    prevProps.handleChange === nextProps.handleChange &&
    prevProps.handleDeleteItem === nextProps.handleDeleteItem &&
    prevProps.setHistory === nextProps.setHistory &&
    prevProps.setReloadTableData === nextProps.setReloadTableData &&
    prevProps.handleUpdateProgress === nextProps.handleUpdateProgress
  );
});
