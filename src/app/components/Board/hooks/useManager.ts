import { useState, useCallback } from "react";
import { Manager } from "../types/table";
import { managerService } from "../services/managerService";

export const useManager = (projectId: number | null) => {
  const [managers, setManagers] = useState<Manager[]>([]);

  const fetchManagers = useCallback(async () => {
    const data = await managerService.getManagersPermissions(projectId);
    setManagers(data);
  }, [projectId]);

  const updatePermission = useCallback(
    async (
      permissionId: number,
      userId: number,
      permissions: Record<string, boolean>
    ) => {
      await managerService.updateManagerPermission(
        permissionId,
        projectId,
        userId,
        permissions
      );
      await fetchManagers();
    },
    [projectId, fetchManagers]
  );

  const removeManager = useCallback(
    async (managerId: number) => {
      await managerService.removeManager(projectId, managerId);
      await fetchManagers();
    },
    [projectId, fetchManagers]
  );

  const sendInvitation = useCallback(
    async (data: { username: string; title: string; content: string }) => {
      await managerService.sendInvitation(projectId, data);
      await fetchManagers();
    },
    [projectId, fetchManagers]
  );

  return {
    managers,
    fetchManagers,
    updatePermission,
    removeManager,
    sendInvitation,
  };
};
