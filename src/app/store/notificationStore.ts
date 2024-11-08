import { create } from 'zustand';
import apiClient from "@/app/utils/apiClient";
import { toast } from "react-toastify";

export interface Invitation {
  id: number;
  status: boolean | null;
  isReplied: boolean;
  content: string;
  title: string;
}

interface NotificationStore {
  invitations: Invitation[];
  reloadTrigger: boolean;
  setInvitations: (invitations: Invitation[]) => void;
  triggerReload: () => void;
  fetchInvitations: () => Promise<void>;
  handleReply: (item: Invitation, status: boolean) => Promise<void>;
  handleDelete: (item: Invitation) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  invitations: [],
  reloadTrigger: false,
  setInvitations: (invitations) => set({ invitations }),
  triggerReload: () => set((state) => ({ reloadTrigger: !state.reloadTrigger })),

  fetchInvitations: async () => {
    try {
      const { data } = await apiClient.get('/api/invitation/');
      const updatedData = data
        .reverse()
        .map((item: Invitation) => ({
          ...item,
          isReplied: item.status !== null,
        }));
      set({ invitations: updatedData });
    } catch {
      toast.error("Không thể tải thông báo");
    }
  },

  handleReply: async (item: Invitation, status: boolean) => {
    const updatedItem = {
      ...item,
      status,
      isReplied: true,
      content: status ? "Bạn đã chấp nhận lời mời" : "Bạn đã từ chối lời mời"
    };

    try {
      await apiClient.patch(`/api/invitation/${item.id}/`, updatedItem);
      get().triggerReload();
    } catch {
      toast.error("Không thể cập nhật lời mời");
    }
  },

  handleDelete: async (item: Invitation) => {
    if (!window.confirm("Bạn có muốn xóa không?")) return;

    try {
      await apiClient.delete(`/api/invitation/${item.id}/`);
      toast.success("Đã xóa thành công");
      get().triggerReload();
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  },
}));
