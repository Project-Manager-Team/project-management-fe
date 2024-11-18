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
import { marked } from 'marked';

interface UseProjectReturn {
  listProject: Item[];
  isCreating: boolean;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  isNavigating: boolean;
  hasUnsavedChanges: () => boolean;
  handleChange: (index: number, name: ItemProperty, value: string | number | boolean | null) => void;
  handleEditItem: (index: number) => Promise<void>;
  handleDeleteItem: (id: number | null) => void;
  handleCreateAndSaveItem: () => Promise<void>;
  handleUpdateProgress: (id: number, progress: number) => Promise<void>;
  handleNavigateToChild: (item: Item) => void;
  handleColorChange: (index: number, color: string | null) => Promise<void>;
  handleGenerateReport: (item: Item) => Promise<void>;
}

export const useProject = (
  currentProjectId: number,
  currentProjectUrl: string
): UseProjectReturn => {
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
      if (item.id === null) {
        toast.error("Không thể tạo báo cáo cho item chưa được lưu!");
        return;
      }
      
      const reportMarkdown = await projectService.generateAIReport(item.id);
      
      // Create overlay background
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
      `;

      // Create modal content
      const modalContent = document.createElement('div');
      modalContent.className = 'report-modal';
      const htmlContent = await marked(reportMarkdown); // Add await here
      modalContent.innerHTML = htmlContent;
      
      // Detect system theme
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Apply theme-aware styles
      modalContent.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${isDarkMode ? '#1a1a1a' : 'white'};
        color: ${isDarkMode ? '#e0e0e0' : '#1a1a1a'};
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 1000;
        font-size: 16px;
        line-height: 1.6;
      `;

      // Style markdown content
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        .report-modal h1, .report-modal h2, .report-modal h3 {
          color: ${isDarkMode ? '#fff' : '#000'};
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .report-modal ul, .report-modal ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .report-modal li {
          margin-bottom: 0.5em;
        }
      `;
      modalContent.appendChild(styleSheet);

      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerText = 'Đóng';
      closeButton.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        padding: 8px 15px;
        border: none;
        background: ${isDarkMode ? '#333' : '#f0f0f0'};
        color: ${isDarkMode ? '#fff' : '#000'};
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
        &:hover {
          background: ${isDarkMode ? '#444' : '#e0e0e0'};
        }
      `;
      
      const cleanup = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modalContent);
      };

      closeButton.onclick = cleanup;
      overlay.onclick = cleanup;
      
      modalContent.appendChild(closeButton);
      document.body.appendChild(overlay);
      document.body.appendChild(modalContent);

      toast.success("Báo cáo đã được tạo thành công!");
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
