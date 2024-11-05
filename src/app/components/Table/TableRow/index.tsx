import React, { memo, useState, useEffect, useRef } from "react";
import { HistoryItem, Manager, PermissionKey } from "../interfaces";
import {
  FiEdit,
  FiSave,
  FiTrash2,
  FiCheckSquare,
  FiFolder,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import apiClient from "@/utils";
import { toast } from "react-toastify";
import Image from "next/image";
import { DOMAIN } from '@/app/config';
import ManagerButton from "./ManagerButton";

interface LocalTableRowProps {
  item: {
    id: number;
    index: number;
    type: string;
    title: string;
    description?: string;
    beginTime?: string;
    endTime?: string;
    owner?: {
      avatar?: string;
      username: string;
    };
    progress: number;
    isEditing: boolean;
  };
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
  selectedColumns: string[];
}

const TableRow: React.FC<LocalTableRowProps> = ({
  item,
  handleChange,
  handleEditItem,
  handleDeleteItem,
  setHistory,
  setReloadTableData,
  handleUpdateProgress,
  selectedColumns,
}) => {
  const [showInviteForm, setShowInviteForm] = useState<boolean>(false);
  const [inviteUsername, setInviteUsername] = useState<string>("");
  const [inviteTitle, setInviteTitle] = useState<string>("");
  const [inviteContent, setInviteContent] = useState<string>("");
  const [managerPermissions, setManagerPermissions] = useState<Manager[]>([]); // Initialize as empty
  const [showManagers, setShowManagers] = useState<boolean>(false);

  const inviteFormRef = useRef<HTMLDivElement>(null);
  const managerFormRef = useRef<HTMLDivElement>(null); // Added ref for managers modal

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showInviteForm &&
        inviteFormRef.current &&
        !inviteFormRef.current.contains(event.target as Node)
      ) {
        setShowInviteForm(false);
      }
      if (
        showManagers &&
        managerFormRef.current &&
        !managerFormRef.current.contains(event.target as Node)
      ) {
        setShowManagers(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showInviteForm, showManagers]);

  useEffect(() => {
    // Fetch managers' permissions when showManagers is true
    const fetchManagersPermissions = async () => {
      try {
        const response = await apiClient.get(
          `/project/${item.id}/managers_permissions/`
        ); // Corrected URL
        setManagerPermissions(response.data);
      } catch {
        toast.error("Không thể lấy dữ liệu quản lý");
      }
    };

    if (showManagers) {
      fetchManagersPermissions();
    }
  }, [showManagers, item.id]);

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

  const handlePermissionChange = (
    managerIndex: number,
    permissionType: PermissionKey, // Updated type
    value: boolean
  ) => {
    setManagerPermissions((prevPermissions) => {
      const updatedPermissions = [...prevPermissions];
      if (updatedPermissions[managerIndex].permissions) {
        updatedPermissions[managerIndex].permissions[permissionType] = value; // Removed type assertion
      }
      return updatedPermissions;
    });
  };

  const savePermissions = async () => {
    try {
      const updatePromises = managerPermissions.map(manager => {
        if (manager.permissions && manager.permission_id && manager.user.id) {
          return apiClient.put(`/permissions/${manager.permission_id}/`, {
            project: item.id,            // Include Project ID
            user: manager.user.id,    // Include Manager ID
            canEdit: manager.permissions.canEdit,
            canDelete: manager.permissions.canDelete,
            canAdd: manager.permissions.canAdd,
            canFinish: manager.permissions.canFinish,
          });
        }
        return Promise.resolve();
      });
  
      await Promise.all(updatePromises);
      toast.success("Cập nhật quyền thành công!");
      setShowManagers(false);
    } catch (error) {
      console.error("Permission update failed:", error);
      toast.error("Cập nhật quyền không thành công");
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
        {/* Removed Empty Cell for Column Selection */}
        
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
                item.isEditing ? 'bg-yellow-50 border border-blue-500' : 'bg-transparent'
              } focus:outline-none focus:ring-0 text-black rounded-lg`}
              value={item.title || ""}
              onChange={(e) =>
                handleChange(item.index, e.target.name, e.target.value)
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
                item.isEditing ? 'bg-yellow-50 border border-blue-500' : 'bg-transparent'
              } focus:outline-none focus:ring-0 text-black rounded-lg`}
              value={item.description || ""}
              onChange={(e) =>
                handleChange(item.index, e.target.name, e.target.value)
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
                  item.isEditing ? 'bg-yellow-50 border border-blue-500' : 'bg-transparent'
                } focus:outline-none focus:ring-0 text-black rounded-lg`}
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
          </td>
        )}
        {selectedColumns.includes("endTime") && (
          <td className="py-3 px-6 text-left bg-white rounded-lg">
            {item.isEditing ? (
              <input
                type="datetime-local"
                name="endTime"
                className={`w-full ${
                  item.isEditing ? 'bg-yellow-50 border border-blue-500' : 'bg-transparent'
                } focus:outline-none focus:ring-0 text-black rounded-lg`}
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
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
        <td className="py-3 px-6 text-right">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <button
              className="p-2 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
              onClick={() => {
                if (item.title.trim() === "") {
                  toast.error("Title is required");
                } else {
                  handleEditItem(item.index);
                }
              }}
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
            <ManagerButton
              onClick={() => setShowManagers(true)}
            />
            <button
              className="p-2 bg-green-500 text-white border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
              onClick={() => setShowInviteForm(true)} // Add this line
              aria-label="Invite"
            >
              <FiUserPlus className="w-5 h-5" /> {/* Add this icon */}
            </button>
          </div>
        </td>
      </tr>
      {showManagers && (
        <tr>
          <td colSpan={columnCount}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div
                ref={managerFormRef}
                className="bg-white p-4 rounded-lg shadow-lg z-60 max-w-3xl w-full mx-4"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from triggering the outside click handler
              >
                <h3 className="text-lg font-semibold mb-4">Quản lý</h3>
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200">Quản lý</th>
                      <th className="py-2 px-4 border-b border-gray-200">Quyền sửa</th>
                      <th className="py-2 px-4 border-b border-gray-200">Quyền hoàn thành</th>
                      <th className="py-2 px-4 border-b border-gray-200">Quyền th��m</th>
                      <th className="py-2 px-4 border-b border-gray-200">Quyền xoá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerPermissions.map((manager, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            {manager.user.avatar ? (
                              <Image
                                src={
                                  manager.user.avatar.startsWith("http")
                                    ? manager.user.avatar
                                    : `${DOMAIN}${manager.user.avatar}`
                                }
                                alt={manager.user.username}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <FiUser className="w-8 h-8 text-gray-500" />
                            )}
                            <span>{manager.user.username}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <select
                            value={manager.permissions ? (manager.permissions.canEdit ? 'yes' : 'no') : 'no'}
                            onChange={(e) =>
                              handlePermissionChange(index, 'canEdit', e.target.value === 'yes')
                            }
                            className="border rounded p-1 w-full"
                          >
                            <option value="yes">Có</option>
                            <option value="no">Không</option>
                          </select>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <select
                            value={manager.permissions ? (manager.permissions.canFinish ? 'yes' : 'no') : 'no'}
                            onChange={(e) =>
                              handlePermissionChange(index, 'canFinish', e.target.value === 'yes')
                            }
                            className="border rounded p-1 w-full"
                          >
                            <option value="yes">Có</option>
                            <option value="no">Không</option>
                          </select>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <select
                            value={manager.permissions ? (manager.permissions.canAdd ? 'yes' : 'no') : 'no'}
                            onChange={(e) =>
                              handlePermissionChange(index, 'canAdd', e.target.value === 'yes')
                            }
                            className="border rounded p-1 w-full"
                          >
                            <option value="yes">Có</option>
                            <option value="no">Không</option>
                          </select>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <select
                            value={manager.permissions ? (manager.permissions.canDelete ? 'yes' : 'no') : 'no'}
                            onChange={(e) =>
                              handlePermissionChange(index, 'canDelete', e.target.value === 'yes')
                            }
                            className="border rounded p-1 w-full"
                          >
                            <option value="yes">Có</option>
                            <option value="no">Không</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={savePermissions}
                  className="w-full bg-green-500 text-white p-2 rounded mt-4"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => setShowManagers(false)}
                  className="w-full bg-red-500 text-white p-2 rounded mt-2"
                >
                  Đóng
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
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
                  className={`w-full ${
                    item.isEditing ? 'bg-yellow-50 border border-blue-500' : 'bg-transparent'
                  } mb-2 p-2 border rounded`}
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  className={`w-full ${
                    item.isEditing ? 'bg-yellow-50 border border-blue-500' : 'bg-transparent'
                  } mb-2 p-2 border rounded`}
                />
                <textarea
                  placeholder="Content"
                  value={inviteContent}
                  onChange={(e) => setInviteContent(e.target.value)}
                  className={`w-full ${
                    item.isEditing ? 'bg-yellow-50 border border-blue-500' : 'bg-transparent'
                  } mb-2 p-2 border rounded`}
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

export default memo(TableRow);
