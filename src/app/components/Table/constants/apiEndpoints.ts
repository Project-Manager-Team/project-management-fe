
export const API_ENDPOINTS = {
  PROJECT: {
    BASE: '/api/project',
    CHILD: (id: number) => `/api/project/${id}/child`,
    MANAGERS: (id: number) => `/api/project/${id}/managers_permissions/`,
    REMOVE_MANAGER: (id: number) => `/api/project/${id}/remove_manager/`
  },
  PERMISSIONS: {
    UPDATE: (id: number) => `/api/permissions/${id}/`
  },
  INVITATION: '/api/invitation'
} as const;