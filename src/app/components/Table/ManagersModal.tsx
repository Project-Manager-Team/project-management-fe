import React from "react";
import { Manager, Item } from "./interfaces";
import Image from "next/image";
import { DOMAIN } from "@/app/config";
import { FiUser } from "react-icons/fi";

interface ManagersModalProps {
  currentManagerItem: Item;
  managerPermissions: Manager[];
  handlePermissionChange: (
    managerIndex: number,
    permissionType: 'canEdit' | 'canFinish' | 'canAdd' | 'canDelete',
    value: boolean
  ) => void;
  handleOpenInviteForm: (item: Item) => void;
  savePermissions: () => void;
  setShowManagers: React.Dispatch<React.SetStateAction<boolean>>;
}

const ManagersModal: React.FC<ManagersModalProps> = ({
  currentManagerItem,
  managerPermissions,
  handlePermissionChange,
  handleOpenInviteForm,
  savePermissions,
  setShowManagers,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowManagers(false)}>
      <div className="bg-white p-4 rounded-lg shadow-lg z-60 max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4 text-yellow-800">
          Quản lý
        </h3>
        <table className="min-w-full bg-white border border-gray-200 text-yellow-800">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200">
                Quản lý
              </th>
              <th className="py-2 px-4 border-b border-gray-200">
                Quyền sửa
              </th>
              <th className="py-2 px-4 border-b border-gray-200">
                Quyền hoàn thành
              </th>
              <th className="py-2 px-4 border-b border-gray-200">
                Quyền thêm
              </th>
              <th className="py-2 px-4 border-b border-gray-200">
                Quyền xoá
              </th>
            </tr>
          </thead>
          <tbody>
            {managerPermissions.map((manager, index) => (
              <tr key={manager.user.id}>
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
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = "/default-avatar.png";
                        }}
                      />
                    ) : (
                      <FiUser className="w-8 h-8 text-gray-500" />
                    )}
                    <span>{manager.user.username}</span>
                  </div>
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <select
                    value={
                      manager.permissions
                        ? manager.permissions.canEdit
                          ? "yes"
                          : "no"
                        : "no"
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        index,
                        "canEdit",
                        e.target.value === "yes"
                      )
                    }
                    className="border rounded p-1 w-full"
                  >
                    <option value="yes">Có</option>
                    <option value="no">Không</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <select
                    value={
                      manager.permissions
                        ? manager.permissions.canFinish
                          ? "yes"
                          : "no"
                        : "no"
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        index,
                        "canFinish",
                        e.target.value === "yes"
                      )
                    }
                    className="border rounded p-1 w-full"
                  >
                    <option value="yes">Có</option>
                    <option value="no">Không</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <select
                    value={
                      manager.permissions
                        ? manager.permissions.canAdd
                          ? "yes"
                          : "no"
                        : "no"
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        index,
                        "canAdd",
                        e.target.value === "yes"
                      )
                    }
                    className="border rounded p-1 w-full"
                  >
                    <option value="yes">Có</option>
                    <option value="no">Không</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <select
                    value={
                      manager.permissions
                        ? manager.permissions.canDelete
                          ? "yes"
                          : "no"
                        : "no"
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        index,
                        "canDelete",
                        e.target.value === "yes"
                      )
                    }
                    className="border rounded p-1 w-full"
                  >
                    <option value="yes">Có</option>
                    <option value="no">Không</option>
                  </select>
                </td>
              </tr>
            ))}
            <tr>
              <td
                className="py-2 px-4 border-b border-gray-200 text-right"
                colSpan={5}
              >
                <button
                  onClick={() => handleOpenInviteForm(currentManagerItem)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  aria-label="Invite Manager"
                >
                  Thêm Người
                </button>
              </td>
            </tr>
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
  );
};

export default ManagersModal;
