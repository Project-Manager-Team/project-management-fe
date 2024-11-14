export const API_ENDPOINTS = {
  PROJECT: {
    BASE: '/api/project/',
    CHILD: (id: number | null) => `/api/project/${id}/child/`,
    DETAIL: (id: number | null) => `/api/project/${id}/`,
    MANAGERS: (id: number | null) => `/api/project/${id}/managers_permissions/`,
  },
  INVITATION: '/api/invitation',
  MANAGER: {
    PERMISSIONS: (projectId: number | null) => `/api/project/${projectId}/managers_permissions/`,
    REMOVE: (projectId: number | null) => `/api/project/${projectId}/remove_manager/`,
    INVITE: '/api/invitation/',
    UPDATE_PERMISSION: (permissionId: number) => `/api/permissions/${permissionId}/`
  }
} as const;