import apiClient from "@/app/utils/apiClient";
import { Item } from "@/app/components/Board/types/board";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { geminiService } from '@/app/services/geminiService';
import { ProjectData } from "../types/project";

export const projectService = {
  async getProjects(url: string): Promise<Item[]> {
    const { data } = await apiClient.get<Item[]>(url);
    return data.filter((item) => item.type !== "personal");
  },

  async createProject(project: Item): Promise<Item> {
    const { data } = await apiClient.post<Item>(
      API_ENDPOINTS.PROJECT.BASE,
      project
    );
    return data;
  },

  async updateProject(
    id: number | null,
    project: Partial<Item>
  ): Promise<void> {
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

  async getProjectReport(id: number): Promise<ProjectData> {
    const { data } = await apiClient.get(API_ENDPOINTS.PROJECT.REPORT(id));
    return data;
  },

  async generateAIReport(id: number | null): Promise<string> {
    if (id === null) {
      throw new Error("Invalid project ID");
    }
    const projectData = await this.getProjectReport(id);
    const report = await geminiService.generateProjectReport(projectData);
    return report;
  },
};
