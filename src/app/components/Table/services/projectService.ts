import apiClient from "@/app/utils/apiClient";
import { Item } from "@/app/components/Table/types/table";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export const projectService = {
  async getProjects(url: string): Promise<Item[]> {
    const { data } = await apiClient.get<Item[]>(url);
    return data.filter((item) => item.type !== "personal");
  },

  async createProject(project: Item): Promise<void> {
    await apiClient.post<Item>(API_ENDPOINTS.PROJECT.BASE, project);
  },

  async updateProject(id: number, project: Partial<Item>): Promise<void> {
    await apiClient.put<Item>(API_ENDPOINTS.PROJECT.DETAIL(id), project);
  },

  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECT.DETAIL(id));
  },

  async updateProgress(id: number, progress: number): Promise<void> {
    await apiClient.patch<Item>(API_ENDPOINTS.PROJECT.DETAIL(id), { progress });
  }
};