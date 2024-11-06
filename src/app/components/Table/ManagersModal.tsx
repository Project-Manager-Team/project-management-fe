import React, { useState } from "react";
import {
  PermissionKey,
  ManagersModalProps,
  ManagerButtonProps,
} from "@/app/types/table";
import Image from "next/image";
import { DOMAIN } from "@/app/config/api";
import { FiUser, FiX, FiTrash2 } from "react-icons/fi";
import {
  Dialog,
  DialogTitle,
  DialogPanel,
  Switch,
  Transition,
} from "@headlessui/react";
import { toast } from "react-toastify";
import apiClient from "@/utils/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteFormSchema, type InviteFormInputs } from "@/app/schemas/form";

// Permission Switch Component
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
      value ? "bg-green-500" : "bg-gray-200"
    } relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1`}
  >
    <span className="sr-only">{value ? "Enabled" : "Disabled"}</span>
    <span
      className={`${
        value ? "translate-x-4" : "translate-x-0.5"
      } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
    />
  </Switch>
);

// ManagerButton Component
export const ManagerButton: React.FC<ManagerButtonProps> = ({
  onClick,
  managersCount,
}) => {
  return (
    <button
      className="relative p-2 bg-blue-500 text-white border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Show Managers"
    >
      <FiUser className="w-5 h-5" />
      {managersCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
          {managersCount}
        </span>
      )}
    </button>
  );
};

// ManagersModal Component
const ManagersModal: React.FC<ManagersModalProps> = ({
  currentManagerItem,
  managerPermissions,
  setManagerPermissions,
  setShowManagers,
  isOpen,
  onClose,
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormInputs>({
    resolver: zodResolver(inviteFormSchema),
  });

  const onSubmit = async (data: InviteFormInputs) => {
    try {
      await apiClient.post("/api/invitation/", {
        username: data.username,
        title: data.title,
        content: data.content,
        project: currentManagerItem.id, // Thêm project ID vào payload
      });

      toast.success("Đã gửi lời mời thành công");
      setIsInviteOpen(false);
      reset();
    } catch {
      toast.error("Không thể gửi lời mời");
    }
  };

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
        [permissionType]: value,
      };

      await apiClient.patch(
        `/api/permissions/${manager.permission_id}/`,
        payload
      );

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

  // Update remove manager handler
  const handleRemoveManager = async (managerId: number) => {
    // Custom toast for confirmation
    const toastId = toast.info(
      <div className="flex flex-col gap-2">
        <p>Bạn có chắc chắn muốn xoá người quản lý này?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              removeManager(managerId);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
          >
            Xoá
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
          >
            Huỷ
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
      }
    );
  };

  // Add helper function to handle actual removal
  const removeManager = async (managerId: number) => {
    try {
      await apiClient.post(
        `/api/project/${currentManagerItem.id}/remove_manager/`,
        {
          managerId,
        }
      );

      const updatedPermissions = managerPermissions.filter(
        (manager) => manager.user.id !== managerId
      );
      setManagerPermissions(updatedPermissions);
      toast.success("Đã xoá người quản lý");
    } catch {
      toast.error("Không thể xoá người quản lý");
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
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-32">
                    Quản lý
                  </th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">
                    Sửa
                  </th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">
                    Hoàn thành
                  </th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">
                    Thêm
                  </th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">
                    Xoá
                  </th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">
                    Thêm thành viên
                  </th>
                  <th className="py-1.5 px-1.5 border-b border-gray-200 w-16">
                    Xoá thành viên
                  </th>
                </tr>
              </thead>
              <tbody>
                {managerPermissions.map((manager, index) => (
                  <tr key={manager.user.id}>
                    <td className="py-1.5 px-1.5 border-b border-gray-200">
                      <div className="flex items-center gap-1 group">
                        <div className="flex items-center gap-1 flex-1">
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
                              onError={(
                                e: React.SyntheticEvent<HTMLImageElement, Event>
                              ) => {
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src =
                                  "/default-avatar.png";
                              }}
                            />
                          ) : (
                            <FiUser className="w-5 h-5 text-gray-500" />
                          )}
                          <span
                            className="truncate max-w-[70px]"
                            title={manager.user.username}
                          >
                            {manager.user.username}
                          </span>
                        </div>

                        {/* Add delete button */}
                        <button
                          onClick={() => handleRemoveManager(manager.user.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full"
                          title="Xoá quản lý"
                        >
                          <FiTrash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                    {[
                      "canEdit",
                      "canFinish",
                      "canAdd",
                      "canDelete",
                      "canAddMember",
                      "canRemoveMember",
                    ].map((permission) => (
                      <td
                        key={permission}
                        className="py-1.5 px-1.5 border-b border-gray-200"
                      >
                        <div className="flex justify-center">
                          <PermissionSwitch
                            value={
                              manager.permissions?.[
                                permission as PermissionKey
                              ] ?? false
                            }
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
                <span>{isInviteOpen ? "Đóng" : "Mời"}</span>
                <svg
                  className={`w-3 h-3 transform transition-transform ${
                    isInviteOpen ? "rotate-45" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <div>
                  <input
                    type="text"
                    placeholder="Tên người dùng *"
                    {...register("username")}
                    className="w-full p-1.5 text-xs border rounded text-yellow-800 focus:border-green-500"
                  />
                  {errors.username && (
                    <span className="text-xs text-red-500">
                      {errors.username.message}
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Tiêu đề *"
                    {...register("title")}
                    className="w-full p-1.5 text-xs border rounded text-yellow-800 focus:border-green-500"
                  />
                  {errors.title && (
                    <span className="text-xs text-red-500">
                      {errors.title.message}
                    </span>
                  )}
                </div>

                <div>
                  <textarea
                    placeholder="Nội dung *"
                    {...register("content")}
                    className="w-full p-1.5 text-xs border rounded text-yellow-800 focus:border-green-500"
                    rows={2}
                  />
                  {errors.content && (
                    <span className="text-xs text-red-500">
                      {errors.content.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 text-white p-1.5 rounded text-xs hover:bg-green-600"
                >
                  Gửi lời mời
                </button>
              </form>
            </div>
          </Transition>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ManagersModal;
