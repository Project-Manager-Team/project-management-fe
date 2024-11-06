import React, { useState } from "react";
import { Manager, Item, PermissionKey } from "./interfaces";
import Image from "next/image";
import { DOMAIN } from "@/app/config";
import { FiUser, FiX } from "react-icons/fi";
import { Dialog, DialogTitle, DialogPanel, Switch, Transition } from '@headlessui/react';
import { toast } from "react-toastify";
import apiClient from "@/utils";

// Remove handlePermissionChange from props since we're handling it internally
interface ManagersModalProps {
  currentManagerItem: Item;
  managerPermissions: Manager[];
  setManagerPermissions: React.Dispatch<React.SetStateAction<Manager[]>>;
  handleOpenInviteForm: (item: Item) => void;
  savePermissions: () => void;
  setShowManagers: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  onClose: () => void;
  inviteUsername: string;
  setInviteUsername: React.Dispatch<React.SetStateAction<string>>;
  inviteTitle: string;
  setInviteTitle: React.Dispatch<React.SetStateAction<string>>;
  inviteContent: string;
  setInviteContent: React.Dispatch<React.SetStateAction<string>>;
  handleInvite: () => void;
}

const PermissionSwitch = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) => (
  <Switch
    checked={value}
    onChange={onChange}
    className={`${
      value ? 'bg-green-500' : 'bg-gray-200'
    } relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1`}
  >
    <span className="sr-only">{value ? 'Enabled' : 'Disabled'}</span>
    <span
      className={`${
        value ? 'translate-x-4' : 'translate-x-0.5'
      } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
    />
  </Switch>
);

const ManagersModal: React.FC<ManagersModalProps> = ({
  currentManagerItem,
  managerPermissions,
  setManagerPermissions,
  setShowManagers,
  isOpen,
  onClose,
  inviteUsername,
  setInviteUsername,
  inviteTitle,
  setInviteTitle,
  inviteContent,
  setInviteContent,
  handleInvite,
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handlePermissionChange = async (
    managerIndex: number,
    permissionType: PermissionKey,
    value: boolean
  ) => {
    const manager = managerPermissions[managerIndex];
    if (!manager.permission_id || !manager.user.id) return;

    try {
      const payload = {
        project: currentManagerItem.id,
        user: manager.user.id,
        [permissionType]: value
      };

      await apiClient.patch(`/api/permissions/${manager.permission_id}/`, payload);
      
      const updatedPermissions = [...managerPermissions];
      if (updatedPermissions[managerIndex].permissions) {
        updatedPermissions[managerIndex].permissions![permissionType] = value;
      }
      setManagerPermissions(updatedPermissions);

    } catch {
      toast.error(`Không thể cập nhật quyền ${permissionType}`);
      const updatedPermissions = [...managerPermissions];
      if (updatedPermissions[managerIndex].permissions) {
        updatedPermissions[managerIndex].permissions![permissionType] = !value;
      }
      setManagerPermissions(updatedPermissions);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-2xl mx-auto p-3 rounded-lg shadow-xl relative">
          <button
            onClick={() => setShowManagers(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>

          <DialogTitle className="text-base font-semibold mb-2 text-yellow-800 pr-8">
            Quản lý
          </DialogTitle>
          
          <div className="overflow-x-auto relative">
            <table className="w-full text-xs bg-white border border-gray-200 text-yellow-800">
              <thead>
                <tr>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-32">Quản lý</th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">Sửa</th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">Hoàn thành</th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">Thêm</th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">Xoá</th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">Thêm thành viên</th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">Xoá thành viên</th>
                </tr>
              </thead>
              <tbody>
                {managerPermissions.map((manager, index) => (
                  <tr key={manager.user.id}>
                    <td className="py-1.5 px-1.5 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        {manager.user.avatar ? (
                          <Image
                            src={
                              manager.user.avatar.startsWith("http")
                                ? manager.user.avatar
                                : `${DOMAIN}${manager.user.avatar}`
                            }
                            alt={manager.user.username}
                            width={20}
                            height={20}
                            className="rounded-full"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = "/default-avatar.png";
                            }}
                          />
                        ) : (
                          <FiUser className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="truncate max-w-[70px]" title={manager.user.username}>
                          {manager.user.username}
                        </span>
                      </div>
                    </td>
                    {['canEdit', 'canFinish', 'canAdd', 'canDelete', 'canAddMember', 'canRemoveMember'].map((permission) => (
                      <td key={permission} className="py-1.5 px-1.5 border-b border-gray-200">
                        <div className="flex justify-center">
                          <PermissionSwitch
                            value={manager.permissions?.[permission as PermissionKey] ?? false}
                            onChange={(value) =>
                              handlePermissionChange(
                                index,
                                permission as PermissionKey,
                                value
                              )
                            }
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-2 flex justify-end">
              <button
                onClick={() => setIsInviteOpen(!isInviteOpen)}
                className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600 inline-flex items-center gap-1"
              >
                <span>{isInviteOpen ? 'Đóng' : 'Mời'}</span>
                <svg 
                  className={`w-3 h-3 transform transition-transform ${isInviteOpen ? 'rotate-45' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <Transition
            show={isInviteOpen}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <div className="mt-3 space-y-2 border-t pt-3">
              <input
                type="text"
                placeholder="Username"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                className="w-full p-1.5 text-xs border rounded text-yellow-800 focus:border-green-500"
                required
              />
              <input
                type="text"
                placeholder="Title"
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
                className="w-full p-1.5 text-xs border rounded text-yellow-800 focus:border-green-500"
                required
              />
              <textarea
                placeholder="Content"
                value={inviteContent}
                onChange={(e) => setInviteContent(e.target.value)}
                className="w-full p-1.5 text-xs border rounded text-yellow-800 focus:border-green-500"
                rows={2}
              />
              <button
                onClick={() => {
                  if (!inviteUsername || !inviteTitle) {
                    toast.error("Vui lòng điền Username và Title!");
                    return;
                  }
                  handleInvite();
                  setIsInviteOpen(false);
                }}
                className="w-full bg-green-500 text-white p-1.5 rounded text-xs hover:bg-green-600"
              >
                Gửi lời mời
              </button>
            </div>
          </Transition>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ManagersModal;
