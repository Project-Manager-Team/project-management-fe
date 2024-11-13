export const API_ENDPOINTS = {
  PROJECT: {
    BASE: '/api/project/',
    CHILD: (id: number) => `/api/project/${id}/child/`,
    DETAIL: (id: number) => `/api/project/${id}/`,
    MANAGERS: (id: number) => `/api/project/${id}/managers_permissions/`,
  },
  INVITATION: '/api/invitation',
  MANAGER: {
    PERMISSIONS: (projectId: number) => `/api/project/${projectId}/managers_permissions/`,
    REMOVE: (projectId: number) => `/api/project/${projectId}/remove_manager/`,
    INVITE: '/api/invitation/',
    UPDATE_PERMISSION: (permissionId: number) => `/api/permissions/${permissionId}/`
  }
} as const;