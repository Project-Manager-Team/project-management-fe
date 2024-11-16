export interface Item {
  id: number | null;  // Cho phép id có thể là null
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
  color: string;
  children?: Item[];
}

export interface Owner {
  username: string;
  avatar: string | null;
}

export interface HistoryItem {
  id: number | null;  // Cập nhật để phù hợp với Item
  title: string;
  url: string;
}

export interface Current {
  url: string;
  id?: number | null;  // Cập nhật để phù hợp với Item
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
  isCreating?: boolean;
  setIsCreating?: React.Dispatch<React.SetStateAction<boolean>>;
  handleNavigateToChild: (item: Item) => void; // Add this handler
  handleColorChange: (index: number, color: string) => void; // Cập nhật kiểu tham số
  onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; // Add this line
}

export interface ManagerButtonProps {
  onClick: () => void;
  managersCount: number;
  size?: "small" | "normal";
}

// Update ManagersModalProps to remove duplicate props and fix conflicts
export interface ManagersModalProps {
  currentManagerItem: Item; 
  managerPermissions: Manager[];
  setManagerPermissions: React.Dispatch<React.SetStateAction<Manager[]>>;
  isOpen: boolean;
  onClose: () => void;
}

// Update TableViewProps

export interface TableViewProps extends CardViewProps {
  selectedColumns: string[];
  isCreating: boolean;
  parentTitle: string; // Add this prop
}

// Update ManagersModalProps
export interface ManagersModalProps {
  currentManagerItem: Item;
  managerPermissions: Manager[];
  setManagerPermissions: React.Dispatch<React.SetStateAction<Manager[]>>;
  isOpen: boolean;
  onClose: () => void;
}

// Update PermissionSwitchProps
export interface PermissionSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

// Update all existing interfaces to match component needs
export interface OwnerButtonProps {
  owner: Owner | null;
  managersCount: number;
  onClick: () => void;
  size?: "small" | "normal";
}

// Update CardViewProps and TableViewProps
export interface CardViewProps {
  items: Item[];
  handleChange: (
    index: number,
    name: ItemProperty,
    value: string | number | boolean | null
  ) => void;
  handleEditItem: (index: number) => void;
  handleDeleteItem: (id: number | null) => void;
  handleUpdateProgress: (id: number, progress: number) => void;
  handleNavigateToChild: (item: Item) => void; // Ensure this is required
  openManagers: (item: Item) => void;
  isCreating: boolean;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
  handleColorChange: (index: number, color: string | null) => void; // Thêm prop này
  handleGenerateReport: (item: Item) => void; // Add this line

  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      item: Item;

      position: { x: number; y: number };
    } | null>
  >;
}

export interface TableViewProps extends CardViewProps {
  selectedColumns: string[];
  parentTitle: string;
}

// Removed CardViewProps as it is equivalent to SharedViewProps

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
