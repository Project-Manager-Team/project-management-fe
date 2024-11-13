import React, { useState, useEffect } from "react";
import {
  PermissionKey,
  ManagerButtonProps,
  Manager
} from "@/app/components/Board/types/table";

import Image from "next/image";
import { DOMAIN } from "@/app/config/api";
import { FiUser, FiTrash2 } from "react-icons/fi";
import { Dialog, DialogPanel, Switch, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteFormSchema, type InviteFormInputs } from "@/app/schemas/form";
import { PermissionSwitchProps } from "@/app/components/Board/types/table";
import { showConfirmationToast } from "@/app/utils/toastUtils";
import { useManager } from "../hooks/useManager";
import apiClient from "@/app/utils/apiClient";

// Permission Switch Component
const PermissionSwitch = ({ value, onChange }: PermissionSwitchProps) => (
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

const ManagersModal: React.FC<ManagersModalProps> = ({
  currentManagerItem,
  isOpen,
  onClose,
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [managerPermissions, setManagerPermissions] = useState<Manager[]>([]);
  const { updatePermission, removeManager, sendInvitation } = useManager(
    currentManagerItem.id
  );

  // Add useEffect to fetch managers data
  useEffect(() => {
    const fetchManagersPermissions = async () => {
      if (currentManagerItem && isOpen) {
        try {
          const response = await apiClient.get<Manager[]>(
            `/api/project/${currentManagerItem.id}/managers_permissions/`
          );
          setManagerPermissions(response.data);
        } catch {
          toast.error("Không thể lấy dữ liệu quản lý");
        }
      }
    };

    fetchManagersPermissions();
  }, [currentManagerItem, isOpen]);

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
      await sendInvitation({
        username: data.username,
        title: data.title,
        content: data.content,
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
      await updatePermission(manager.permission_id, manager.user.id, {
        [permissionType]: value,
      });

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

  const handleRemoveManager = async (managerId: number) => {
    showConfirmationToast("Bạn có muốn xóa không?", async () => {
      try {
        await removeManager(managerId);
        const updatedPermissions = managerPermissions.filter(
          (manager) => manager.user.id !== managerId
        );
        setManagerPermissions(updatedPermissions);
        toast.success("Đã xoá người quản lý");
      } catch {
        toast.error("Không thể xoá người quản lý");
      }
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className="w-full max-w-2xl bg-[var(--card)] text-[var(--card-foreground)]
                              p-4 sm:p-6 rounded-lg shadow-xl overflow-y-auto max-h-[90vh]"
        >
          <div className="space-y-4">
            {/* Mobile view */}
            <div className="block sm:hidden space-y-4">
              {managerPermissions.map((manager, index) => (
                <div
                  key={manager.user.id}
                  className="p-4 bg-[var(--muted)] rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {manager.user.avatar ? (
                        <Image
                          src={
                            manager.user.avatar.startsWith("http")
                              ? manager.user.avatar
                              : `${DOMAIN}${manager.user.avatar}`
                          }
                          alt={manager.user.username}
                          width={24}
                          height={24}
                          className="rounded-full"
                          onError={(
                            e: React.SyntheticEvent<HTMLImageElement, Event>
                          ) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <FiUser className="w-6 h-6 text-gray-500" />
                      )}
                      <span className="font-medium">
                        {manager.user.username}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveManager(manager.user.id)}
                      className="p-1.5 hover:bg-red-100 rounded-full"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Sửa", "canEdit"],
                      ["Hoàn thành", "canFinish"],
                      ["Thêm", "canAdd"],
                      ["Xoá", "canDelete"],
                      ["Thêm TV", "canAddMember"],
                      ["Xoá TV", "canRemoveMember"],
                    ].map(([label, permission]) => (
                      <div
                        key={permission}
                        className="flex items-center justify-between p-2 bg-[var(--card)] rounded"
                      >
                        <span className="text-xs">{label}</span>
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
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view */}
            <div className="hidden sm:block">
              <table className="w-full border-collapse divide-y divide-[var(--muted)]">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left">Quản lý</th>
                    <th className="py-2 px-3 text-center">Sửa</th>
                    <th className="py-2 px-3 text-center">Hoàn thành</th>
                    <th className="py-2 px-3 text-center">Thêm</th>
                    <th className="py-2 px-3 text-center">Xoá</th>
                    <th className="py-2 px-3 text-center">Thêm TV</th>
                    <th className="py-2 px-3 text-center">Xoá TV</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {managerPermissions.map((manager, index) => (
                    <tr key={manager.user.id}>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {manager.user.avatar ? (
                            <Image
                              src={
                                manager.user.avatar.startsWith("http")
                                  ? manager.user.avatar
                                  : `${DOMAIN}${manager.user.avatar}`
                              }
                              alt={manager.user.username}
                              width={24}
                              height={24}
                              className="rounded-full"
                              onError={(
                                e: React.SyntheticEvent<HTMLImageElement, Event>
                              ) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/default-avatar.png";
                              }}
                            />
                          ) : (
                            <FiUser className="w-5 h-5 text-gray-500" />
                          )}
                          <span>{manager.user.username}</span>
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
                        <td key={permission} className="py-2 px-3 text-center">
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
                        </td>
                      ))}
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleRemoveManager(manager.user.id)}
                          className="p-1.5 hover:bg-red-100 rounded-full"
                        >
                          <FiTrash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invite Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsInviteOpen(!isInviteOpen)}
                className="bg-green-500 text-white px-3 py-1.5 text-sm rounded-lg 
                          hover:bg-green-600 inline-flex items-center gap-2"
              >
                <span>{isInviteOpen ? "Đóng" : "Mời"}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${
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

            {/* Invite Form */}
            <Transition
              show={isInviteOpen}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <div className="mt-3 space-y-3 border-t pt-3">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Tên người dùng *"
                        {...register("username")}
                        className="w-full p-2 text-sm border rounded-lg bg-[var(--input)] 
                                text-[var(--input-foreground)] focus:border-green-500 
                                focus:ring-1 focus:ring-green-500"
                      />
                      {errors.username && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.username.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Tiêu đề *"
                        {...register("title")}
                        className="w-full p-2 text-sm border rounded-lg bg-[var(--input)] 
                                text-[var(--input-foreground)] focus:border-green-500 
                                focus:ring-1 focus:ring-green-500"
                      />
                      {errors.title && (
                        <span className="text-xs text-red-500 mt-1">
                          {errors.title.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <textarea
                      placeholder="Nội dung *"
                      {...register("content")}
                      className="w-full p-2 text-sm border rounded-lg bg-[var(--input)] 
                              text-[var(--input-foreground)] focus:border-green-500 
                              focus:ring-1 focus:ring-green-500"
                      rows={3}
                    />
                    {errors.content && (
                      <span className="text-xs text-red-500 mt-1">
                        {errors.content.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-500 text-white p-2 rounded-lg text-sm 
                            hover:bg-green-600 transition-colors"
                  >
                    Gửi lời mời
                  </button>
                </form>
              </div>
            </Transition>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

// Update the prop types
interface ManagersModalProps {
  currentManagerItem: {
    id: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default ManagersModal;
