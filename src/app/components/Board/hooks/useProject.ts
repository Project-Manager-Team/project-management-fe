import { useReducer, useCallback, useEffect, useRef } from "react";
import { useAppStore } from "@/app/store/appStore";
import { Item, ItemProperty } from "@/app/components/Board/types/board";
import { projectService } from "@/app/components/Board/services/projectService";
import { toast } from "react-toastify";
import { showConfirmationToast } from "@/app/utils/toastUtils";
import {
  projectReducer,
  initialState,
} from "@/app/components/Board/reducers/projectReducer";
import { Dispatch, SetStateAction } from "react";
import debounce from "lodash/debounce";

export const useProject = (
  currentProjectId: number,
  currentProjectUrl: string
) => {
  const { history, setHistory, shouldReloadBoard, setShouldReloadBoard } =
    useAppStore();
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { listProject, isCreating, isNavigating } = state;

  const hasUnsavedChanges = useCallback(() => {
    return isCreating || listProject.some((item) => item.isEditing);
  }, [isCreating, listProject]);

  // Tối ưu hóa getProjectsData với debounce
  const debouncedGetProjectsData = useCallback(
    debounce(async (url: string) => {
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
        setShouldReloadBoard(false);
      }
    }, 300),
    []
  );

  const handleChange = (
    index: number,
    name: ItemProperty,
    value: string | number | boolean | null
  ) => {
    const item = listProject[index];
    if (item) {
      dispatch({
        type: "UPDATE_ITEM",
        payload: {
          index,
          item: {
            ...item, // Giữ lại các giá trị cũ
            [name]: value,
          },
        },
      });
    }
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
          projectService
            .deleteProject(id)
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
    if (isCreating) {
      // Find the new item
      const newItem = listProject.find((item) => !item.id);
      if (!newItem) return;

      try {
        // Save to server
        const savedItem = await projectService.createProject(newItem);

        // Update the state with saved item
        dispatch({
          type: "REPLACE_ITEM",
          payload: {
            oldId: null,
            newItem: savedItem,
          },
        });
        dispatch({ type: "SET_CREATING", payload: false });
        toast.success("Tạo Mới thành công");
      } catch {
        toast.error("Không thể lưu!");
      }
    } else {
      const newItem: Item = {
        id: null,
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
        color: "",
        diffLevel: 1,
      };

      dispatch({ type: "ADD_ITEM", payload: newItem });
      dispatch({ type: "SET_CREATING", payload: true });
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

  const handleColorChange = async (index: number, color: string | null) => {
    try {
      const currentItem = listProject[index];

      // Cập nhật UI trước
      dispatch({
        type: "UPDATE_ITEM",
        payload: { index, item: { color: color ?? undefined } },
      });

      await projectService.updateProject(currentItem.id, {
        color: color ?? undefined,
      });
    } catch {}
  };

  const isInitialMount = useRef(true);

  const navigateToChild = useCallback(
    (item: Item) => {
      if (!item || isNavigating) return;
      const newHistory = [
        ...history,
        {
          id: item.id,
          url: `/api/project/${item.id}/child`,
          title: item.title || "",
        },
      ];

      setHistory(newHistory);
    },
    [history, isNavigating, setHistory]
  );

  const handleNavigateToChild = useCallback(
    (item: Item) => {
      if (item.isEditing || isCreating) {
        toast.warning("Vui lòng lưu thay đổi trước khi chuyển trang!");
        return;
      }
      navigateToChild(item);
    },
    [isCreating, navigateToChild]
  );

  // Data fetching control
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const fetchData = async () => {
      if (!currentProjectUrl || isFetchingRef.current) return;

      isFetchingRef.current = true;
      try {
        const data = await projectService.getProjects(currentProjectUrl);
        dispatch({ type: "SET_PROJECTS", payload: data });
      } catch {
        dispatch({ type: "CLEAR_PROJECTS" });
        toast.error("Lấy dữ liệu không thành công");
      } finally {
        isFetchingRef.current = false;
        setShouldReloadBoard(false);
      }
    };

    fetchData();
  }, [currentProjectUrl]);

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

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      debouncedGetProjectsData.cancel();
    };
  }, [debouncedGetProjectsData]);

  const setIsCreating: Dispatch<SetStateAction<boolean>> = (value) => {
    if (typeof value === "function") {
      const prevState = state.isCreating;
      dispatch({
        type: "SET_CREATING",
        payload: (value as (prev: boolean) => boolean)(prevState),
      });
    } else {
      dispatch({ type: "SET_CREATING", payload: value });
    }
  };

  const isFetchingRef = useRef(false); // Thêm ref để kiểm soát việc gọi API

  const getProjectsData = useCallback(
    async (url: string) => {
      if (isFetchingRef.current) return; // Nếu đang fetch thì không gọi lại
      isFetchingRef.current = true;

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
        setShouldReloadBoard(false);
        isFetchingRef.current = false;
      }
    },
    [dispatch, setShouldReloadBoard]
  );

  // Điều chỉnh useEffect để chỉ gọi API khi cần thiết
  useEffect(() => {
    if (
      currentProjectUrl &&
      shouldReloadBoard &&
      !isNavigating &&
      !isCreating
    ) {
      getProjectsData(currentProjectUrl);
    }
  }, [
    currentProjectUrl,
    shouldReloadBoard,
    isNavigating,
    isCreating,
    getProjectsData,
  ]);

  const handleGenerateReport = async (item: Item) => {
    try {
      const report = await projectService.generateAIReport(item.id);
      toast.success("Báo cáo đã được tạo thành công!");
      return report;
    } catch {
      toast.error("Có lỗi khi tạo báo cáo!");
    }
  };

  return {
    listProject,
    isCreating,
    setIsCreating,
    isNavigating,
    hasUnsavedChanges,
    handleChange,
    handleEditItem,
    handleDeleteItem,
    handleCreateAndSaveItem,
    handleUpdateProgress,
    handleNavigateToChild,
    handleColorChange,
    handleGenerateReport,
  };
};
