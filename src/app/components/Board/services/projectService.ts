import apiClient from "@/app/utils/apiClient";
import { Item } from "@/app/components/Board/types/table";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export const projectService = {
  async getProjects(url: string): Promise<Item[]> {
    const { data } = await apiClient.get<Item[]>(url);
    return data.filter((item) => item.type !== "personal");
  },

  async createProject(project: Item): Promise<Item> {
    const { data } = await apiClient.post<Item>(API_ENDPOINTS.PROJECT.BASE, project);
    return data;
  },

  async updateProject(id: number | null, project: Partial<Item>): Promise<void> {
    const { color, ...otherData } = project;
    await apiClient.patch<Item>(API_ENDPOINTS.PROJECT.DETAIL(id), {
      ...otherData,
      color: color || null, // Đảm bảo color được gửi đi
    });
  },

  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECT.DETAIL(id));
  },

  async updateProgress(id: number, progress: number): Promise<void> {
    await apiClient.patch<Item>(API_ENDPOINTS.PROJECT.DETAIL(id), { progress });
  },
};
