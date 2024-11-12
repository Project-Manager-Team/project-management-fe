
import apiClient from "@/app/utils/apiClient";
import { Item, Manager } from "@/app/components/Table/types/table";

export const projectService = {
  // Fetch projects
  async getProjects(url: string): Promise<Item[]> {
    const { data } = await apiClient.get<Item[]>(url);
    return data.filter((item) => item.type !== "personal");
  },

  // Create project
  async createProject(project: Item): Promise<Item> {
    const { data } = await apiClient.post<Item>("/api/project/", project);
    return data;
  },

  // Update project
  async updateProject(id: number, project: Partial<Item>): Promise<Item> {
    const { data } = await apiClient.put<Item>(`/api/project/${id}/`, project);
    return data;
  },

  // Delete project
  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(`/api/project/${id}/`);
  },

  // Update progress
  async updateProgress(id: number, progress: number): Promise<Item> {
    const { data } = await apiClient.patch<Item>(`/api/project/${id}/`, { progress });
    return data;
  },

  // Get managers permissions
  async getManagersPermissions(projectId: number): Promise<Manager[]> {
    const { data } = await apiClient.get<Manager[]>(
      `/api/project/${projectId}/managers_permissions/`
    );
    return data;
  },

  // Update manager permissions
  async updateManagerPermission(
    permissionId: number,
    projectId: number,
    userId: number,
    permissions: Record<string, boolean>
  ): Promise<void> {
    await apiClient.patch(`/api/permissions/${permissionId}/`, {
      project: projectId,
      user: userId,
      ...permissions
    });
  },

  // Remove manager
  async removeManager(projectId: number, managerId: number): Promise<void> {
    await apiClient.post(`/api/project/${projectId}/remove_manager/`, {
      managerId
    });
  },

  // Send invitation
  async sendInvitation(projectId: number, data: {
    username: string;
    title: string;
    content: string;
  }): Promise<void> {
    await apiClient.post("/api/invitation/", {
      ...data,
      project: projectId
    });
  }
};