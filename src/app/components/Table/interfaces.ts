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
  owner: Owner | null; // Added owner property
  [key: string]: unknown;
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

export interface TableRowProps {
  item: Item;
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
}

export interface Manager {
  user: {
    id: number;               // Ensure Manager has an ID
    username: string;
    avatar: string | null;
  };
  permission_id: number | null;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canAdd: boolean;
    canFinish: boolean;
  } | null;
}

export type PermissionKey = keyof NonNullable<Manager['permissions']>;
