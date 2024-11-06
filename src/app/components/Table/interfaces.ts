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
  | 'canEdit' 
  | 'canFinish' 
  | 'canAdd' 
  | 'canDelete'
  | 'canAddMember'
  | 'canRemoveMember';

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
  canAddMember: boolean;  // Add new permission
  canRemoveMember: boolean;  // Add new permission
}

export interface Manager {
  user: User;
  permission_id?: number;
  permissions?: Permissions;
}

export type ItemProperty = keyof Item;

export interface PermissionUpdatePayload {
  project: number;
  user: number;
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canFinish: boolean;
  canAddMember: boolean;  // Add new permission
  canRemoveMember: boolean;  // Add new permission
}
