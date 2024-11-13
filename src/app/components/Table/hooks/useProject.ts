import { useReducer, useCallback, useEffect } from "react";
import { useAppStore } from "@/app/store/appStore";
import { Item, ItemProperty } from "@/app/components/Table/types/table";
import { projectService } from '@/app/components/Table/services/projectService';
import { toast } from "react-toastify";
import { showConfirmationToast } from "@/app/utils/toastUtils";
import {
  projectReducer,
  initialState,
} from "@/app/components/Table/reducers/projectReducer";
import { Dispatch, SetStateAction } from 'react';

export const useProject = (
  currentProjectId: number,
  currentProjectUrl: string
) => {
  const { history, setHistory, shouldReloadTable, setShouldReloadTable } =
    useAppStore();
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { listProject, isCreating, isNavigating } = state;

  const hasUnsavedChanges = useCallback(() => {
    return isCreating || listProject.some((item) => item.isEditing);
  }, [isCreating, listProject]);

  // Data fetching
  const getProjectsData = async (url: string) => {
    try {
      const accessToken = sessionStorage.getItem("access");
      if (!accessToken) {
        dispatch({ type: "CLEAR_PROJECTS" });
        return;
      }

      const data = await projectService.getProjects(url);
      dispatch({ type: "SET_PROJECTS", payload: data });
    } catch {
      dispatch({ type: "CLEAR_PROJECTS" });
      toast.error("Lấy dữ liệu không thành công");
    } finally {
      setShouldReloadTable(false);
    }
  };

  const handleChange = (
    index: number,
    name: ItemProperty,
    value: string | number | boolean | null
  ) => {
    dispatch({
      type: "UPDATE_ITEM",
      payload: { index, item: { [name]: value } },
    });
  };

  const handleEditItem = async (index: number) => {
    const currentItem = listProject[index];
    dispatch({ type: "TOGGLE_EDIT", payload: index });

    if (currentItem.isEditing) {
      try {
        await projectService.updateProject(currentItem.id, currentItem);
        toast.success("Cập nhật thành công!");
      } catch {
        toast.error("Cập nhật không thành công");
      }
    }
  };

  const handleDeleteItem = useCallback(
    (id: number | null) => {
      if (id === null) {
        toast.error("ID không hợp lệ");
        return;
      }

      const hasOtherEditingItems = listProject.some(
        (item) => item.id !== id && (item.isEditing || isCreating)
      );

      if (hasOtherEditingItems) {
        toast.warning("Vui lòng lưu các thay đổi trước khi xóa!");
        return;
      }

      const confirmDelete = () => {
        const itemToDelete = listProject.find((item) => item.id === id);
        const isNewItem =
          isCreating &&
          itemToDelete &&
          itemToDelete.id === listProject[listProject.length - 1].id;

        if (isNewItem) {
          dispatch({ type: "DELETE_ITEM", payload: id });
          toast.success("Đã xoá nhiệm vụ mới tạo!");
        } else {
          projectService.deleteProject(id)
            .then(() => {
              dispatch({ type: "DELETE_ITEM", payload: id });
              toast.success("Xóa nhiệm vụ thành công!");
            })
            .catch(() => toast.error("Không thể xóa nhiệm vụ"));
        }
      };

      showConfirmationToast("Bạn có muốn xóa không?", confirmDelete);
    },
    [listProject, isCreating]
  );

  const handleCreateAndSaveItem = async () => {
    if (!isCreating) {
      const newItem: Item = {
        id: Date.now(),
        index: listProject.length,
        type: "task",
        title: null,
        description: null,
        beginTime: null,
        endTime: null,
        progress: 0,
        manager: null,
        parentId: currentProjectId || null,
        isEditing: true,
        managers: [],
        owner: null,
        managersCount: 0,
        diffLevel: 1,
      };
      dispatch({ type: "ADD_ITEM", payload: newItem });
    } else {
      const newItem = listProject[listProject.length - 1];
      if (!newItem.title?.trim()) {
        toast.error("Tiêu đề là bắt buộc");
        return;
      }
      try {
        await projectService.createProject(newItem);
        dispatch({ type: "SET_CREATING", payload: false });
        await getProjectsData(currentProjectUrl);
        toast.success("Tạo mới nhiệm vụ thành công!");
      } catch {
        toast.error("Không thể tạo mới nhiệm vụ");
      }
    }
  };

  const handleUpdateProgress = async (id: number, progress: number) => {
    try {
      await projectService.updateProgress(id, progress);
      dispatch({ type: "UPDATE_PROGRESS", payload: { id, progress } });
      toast.success("Cập nhật tiến độ thành công!");
    } catch {
      toast.error("Cập nhật tiến độ không thành công");
    }
  };

  // Navigation
  const navigateToChild = useCallback(
    (item: Item) => {
      if (isNavigating) return;
      dispatch({ type: "SET_NAVIGATING", payload: true });

      const newHistory = [
        ...history,
        {
          id: item.id,
          url: `/api/project/${item.id}/child`,
          title: item.title || "",
        },
      ];
      setHistory(newHistory);
      setShouldReloadTable(true);

      setTimeout(
        () => dispatch({ type: "SET_NAVIGATING", payload: false }),
        500
      );
    },
    [history, isNavigating, setHistory, setShouldReloadTable]
  );

  // Navigation handler moved from CardView
  const handleCardClick = useCallback(
    (item: Item) => {
      if (item.isEditing || isCreating) {
        toast.warning("Vui lòng lưu thay đổi trước khi chuyển trang!");
        return;
      }
      navigateToChild(item);
    },
    [isCreating, navigateToChild]
  );

  // Load initial data
  useEffect(() => {
    if (currentProjectUrl) {
      getProjectsData(currentProjectUrl);
    }
  }, [currentProjectUrl, shouldReloadTable]);

  // Add navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const setIsCreating: Dispatch<SetStateAction<boolean>> = (value) => {
    if (typeof value === 'function') {
      const prevState = state.isCreating;
      dispatch({ 
        type: "SET_CREATING", 
        payload: (value as (prev: boolean) => boolean)(prevState) 
      });
    } else {
      dispatch({ type: "SET_CREATING", payload: value });
    }
  };

  return {
    listProject,
    isCreating,
    setIsCreating, // Now properly typed
    isNavigating,
    hasUnsavedChanges,
    handleChange,
    handleEditItem,
    handleDeleteItem,
    handleCreateAndSaveItem,
    handleUpdateProgress,
    navigateToChild,
    handleCardClick, // Add this handler
  };
};
