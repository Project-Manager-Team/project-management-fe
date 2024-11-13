import apiClient from "@/app/utils/apiClient";
import { Item, Manager } from "@/app/components/Table/types/table";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export const projectService = {
  // Fetch projects
  async getProjects(url: string): Promise<Item[]> {
    const { data } = await apiClient.get<Item[]>(url);
    return data.filter((item) => item.type !== "personal");
  },

  // Create project
  async createProject(project: Item): Promise<Item> {
    const { data } = await apiClient.post<Item>(API_ENDPOINTS.PROJECT.BASE, project);
    return data;
  },

  // Update project
  async updateProject(id: number, project: Partial<Item>): Promise<void> {
    await apiClient.put<Item>(API_ENDPOINTS.PROJECT.DETAIL(id), project);
  },

  // Delete project
  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECT.DETAIL(id));
  },

  // Update progress
  async updateProgress(id: number, progress: number): Promise<void> {
    await apiClient.patch<Item>(API_ENDPOINTS.PROJECT.UPDATE_PROGRESS(id), { progress });
  },

  // Get managers permissions
  async getManagersPermissions(projectId: number): Promise<Manager[]> {
    const { data } = await apiClient.get<Manager[]>(API_ENDPOINTS.PROJECT.MANAGERS(projectId));
    return data;
  },

  // Update manager permissions
  async updateManagerPermission(
    permissionId: number,
    projectId: number,
    userId: number,
    permissions: Record<string, boolean>
  ): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.PERMISSIONS.UPDATE(permissionId), {
      project: projectId,
      user: userId,
      ...permissions
    });
  },

  // Remove manager
  async removeManager(projectId: number, managerId: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PROJECT.REMOVE_MANAGER(projectId), {
      managerId
    });
  },

  // Send invitation
  async sendInvitation(projectId: number, data: {
    username: string;
    title: string;
    content: string;
  }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.INVITATION, {
      ...data,
      project: projectId
    });
  }
};