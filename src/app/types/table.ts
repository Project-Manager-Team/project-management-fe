export interface Item {
  id: number;
  index: number;
  type: string;
  title: string | null;
  description: string | null;
  beginTime: string | null;
  endTime: string | null;
  progress: number;
  manager: string | null;
  parentId: number | null;
  isEditing: boolean;
  managers?: Manager[];
  owner: Owner | null;
  managersCount: number;
  diffLevel: number | null; // Change from string | null to number | null
}

export interface Owner {
  username: string;
  avatar: string | null;
}

export interface HistoryItem {
  id: number;
  title: string;
  url: string;
}

export interface Current {
  url: string;
  id?: number;
  title: string;
}

export type PermissionKey =
  | "canEdit"
  | "canFinish"
  | "canAdd"
  | "canDelete"
  | "canAddMember"
  | "canRemoveMember";

export interface User {
  id: number;
  username: string;
  avatar: string | null;
}

export interface Permissions {
  canEdit: boolean;
  canFinish: boolean;
  canAdd: boolean;
  canDelete: boolean;
  canAddMember: boolean;
  canRemoveMember: boolean;
}

export interface Manager {
  user: User;
  permission_id?: number;
  permissions?: Permissions;
}

// Props interfaces
export interface TableProps {
  current: Current;
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  reloadTableData: boolean;
  setReloadTableData: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Column {
  id: string;
  label: string;
}

export interface ColumnToggleProps {
  enabled: boolean;
  onChange: (checked: boolean) => void;
}

export type ItemProperty = keyof Item;

export interface PermissionUpdatePayload {
  project: number;
  user: number;
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canFinish: boolean;
  canAddMember: boolean;
  canRemoveMember: boolean;
}

// Props interfaces moved from components
export interface TableRowProps {
  item: Item;
  handleChange: (
    index: number,
    name: ItemProperty,
    value: string | number | boolean | null
  ) => void;
  handleEditItem: (index: number) => void;
  handleDeleteItem: (id: number | null) => void;
  handleUpdateProgress: (id: number, progress: number) => void;
  selectedColumns: string[];
  openManagers: (item: Item) => void;
  openInviteForm?: (item: Item) => void;
}

export interface ManagerButtonProps {
  onClick: () => void;
  managersCount: number;
  size?: 'small' | 'normal';
}

export interface ManagersModalProps {
  currentManagerItem: Item;
  managerPermissions: Manager[];
  setManagerPermissions: React.Dispatch<React.SetStateAction<Manager[]>>;
  setShowManagers: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  onClose: () => void;
  handleInvite: (data: {
    username: string;
    title: string;
    content: string;
  }) => Promise<void>;
}

// Thêm vào danh sách các cột có thể
export const DEFAULT_COLUMNS = [
  "type",
  "title",
  "description",
  "beginTime",
  "endTime",
  "owner",
  "progress", // Đặt progress sau diffLevel
  "diffLevel", // Thay đổi thứ tự
];
