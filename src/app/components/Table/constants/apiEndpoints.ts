export const API_ENDPOINTS = {
  PROJECT: {
    BASE: '/api/project',
    CHILD: (id: number) => `/api/project/${id}/child`,
    DETAIL: (id: number) => `/api/project/${id}`,
    MANAGERS: (id: number) => `/api/project/${id}/managers_permissions/`,
    REMOVE_MANAGER: (id: number) => `/api/project/${id}/remove_manager/`,
    UPDATE_PROGRESS: (id: number) => `/api/project/${id}/`,
  },
  PERMISSIONS: {
    UPDATE: (id: number) => `/api/permissions/${id}/`
  },
  INVITATION: '/api/invitation'
} as const;