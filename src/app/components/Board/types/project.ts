
export interface ProjectOwner {
  username: string;
  avatar: string;
}

export interface ProjectPermissions {
  id: null;
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canFinish: boolean;
  canAddMember: boolean;
  canRemoveMember: boolean;
}

export interface ProjectData {
  id: number;
  title: string;
  color: string;
  description: string;
  beginTime: string | null;
  completeTime: string | null;
  endTime: string | null;
  type: string;
  managersCount: number;
  owner: ProjectOwner;
  parentId: number | null;
  progress: number;
  diffLevel: number;
  permissions: ProjectPermissions;
  children: ProjectData[];
}