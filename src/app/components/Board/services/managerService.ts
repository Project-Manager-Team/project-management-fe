import apiClient from "@/app/utils/apiClient";
import { Manager } from "@/app/components/Board/types/table";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export const managerService = {
  async getManagersPermissions(projectId: number): Promise<Manager[]> {
    const { data } = await apiClient.get<Manager[]>(
      API_ENDPOINTS.MANAGER.PERMISSIONS(projectId)
    );
    return data;
  },

  async updateManagerPermission(
    permissionId: number,
    projectId: number,
    userId: number,
    permissions: Record<string, boolean>
  ): Promise<void> {
    await apiClient.patch(
      API_ENDPOINTS.MANAGER.UPDATE_PERMISSION(permissionId),
      {
        project: projectId,
        user: userId,
        ...permissions,
      }
    );
  },

  async removeManager(projectId: number, managerId: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MANAGER.REMOVE(projectId), {
      managerId,
    });
  },

  async sendInvitation(
    projectId: number,
    data: {
      username: string;
      title: string;
      content: string;
    }
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MANAGER.INVITE, {
      ...data,
      project: projectId,
    });
  },
};
