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

// Define a union type for all possible property names of Item
export type ItemProperty = keyof Item;
