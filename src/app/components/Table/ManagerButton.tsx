import { FiUser } from "react-icons/fi";
import { Dialog, DialogPanel, Switch } from '@headlessui/react';
import { toast } from "react-toastify";
import apiClient from "@/utils";
import { Manager, Item, PermissionKey } from "./interfaces";

// Manager Button Props
interface ManagerButtonProps {
  onClick: () => void;
  managersCount: number;
}

// Modal Props
interface ManagersModalProps {
  currentManagerItem: Item;
  managerPermissions: Manager[];
  setManagerPermissions: React.Dispatch<React.SetStateAction<Manager[]>>;
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

// Manager Button Component
export const ManagerButton: React.FC<ManagerButtonProps> = ({ onClick, managersCount }) => {
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

// Managers Modal Component
export const ManagersModal: React.FC<ManagersModalProps> = ({
  currentManagerItem,
  managerPermissions,
  setManagerPermissions,
  isOpen,
  onClose,
}) => {

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
      {/* Rest of the modal component code remains the same */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-2xl mx-auto p-3 rounded-lg shadow-xl relative">
          {/* Rest of the DialogPanel content remains the same */}
          {/* ... (previous modal content remains unchanged) ... */}
          {managerPermissions.map((manager, index) => (
            <div key={manager.user.id} className="flex items-center justify-between p-2 border-b">
              <span>{manager.user.username}</span>
              <PermissionSwitch
                value={manager.permissions?.canEdit || false}
                onChange={(value) => handlePermissionChange(index, 'canEdit', value)}
              />
            </div>
          ))}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

const components = { ManagerButton, ManagersModal };
export default components;
