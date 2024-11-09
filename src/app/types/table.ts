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
}

// Add EditableContentProps
export interface EditableContentProps {
  isEditing: boolean;
  value: string | number | boolean | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  name: string;
  type?: string;
  className?: string;
}

// Add AutoResizeTextAreaProps
export interface AutoResizeTextAreaProps {
  content: string | null;
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
  size?: 'small' | 'normal';
}

// Update CardViewProps and TableViewProps
export interface CardViewProps {
  items: Item[];
  handleChange: (index: number, name: ItemProperty, value: string | number | boolean | null) => void;
  handleEditItem: (index: number) => void;
  handleDeleteItem: (id: number | null) => void;
  handleUpdateProgress: (id: number, progress: number) => void;
  openManagers: (item: Item) => void;
}

export interface TableViewProps extends CardViewProps {
  selectedColumns: string[];
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
