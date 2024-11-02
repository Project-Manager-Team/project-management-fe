"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import apiClient from "@/utils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableRow from "./TableRow";
import { Item, Current, HistoryItem } from "./interfaces";
import { FiPlus, FiSave } from "react-icons/fi";

interface TableProps {
  current: Current;
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  reloadTableData: boolean;
  setReloadTableData: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Table({
  current,
  setHistory,
  reloadTableData,
  setReloadTableData,
}: TableProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [listProject, setListProject] = useState<Item[]>([]);

  // Add state for sorting
  const [sortColumn, setSortColumn] = useState<keyof Item | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Implement sorting logic
  const sortedListProject = useMemo(() => {
    if (!sortColumn) return listProject;
    return [...listProject].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (aValue == null) return sortDirection === "asc" ? -1 : 1;
      if (bValue == null) return sortDirection === "asc" ? 1 : -1;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [listProject, sortColumn, sortDirection]);

  const handleChange = useCallback(
    (
      index: number,
      name: string,
      value: string | number | boolean | null
    ) => {
      setListProject((prevList) => {
        const currentItem = prevList[index];
        if (currentItem[name] === value) {
          return prevList;
        }

        const updatedItem = { ...currentItem, [name]: value };
        const updatedList = [...prevList];
        updatedList[index] = updatedItem;
        return updatedList;
      });
    },
    []
  );

  const handleEditItem = useCallback(
    async (index: number) => {
      const currentItem = listProject[index];
      setListProject((prevList) => {
        const updatedList = [...prevList];
        updatedList[index] = {
          ...currentItem,
          isEditing: !currentItem.isEditing,
        };
        return updatedList;
      });

      if (currentItem.isEditing) {
        try {
          await apiClient.put(`project/${currentItem.id}/`, currentItem);
          toast.success("Cập nhật thành công!");
        } catch {
          toast.error("Cập nhật không thành công");
        }
      }
    },
    [listProject]
  );

  const handleDeleteItem = useCallback(
    (id: number | null) => {
      if (id === null) {
        toast.error("ID không hợp lệ");
        return;
      }

      const confirmDelete = () => {
        apiClient
          .delete(`project/${id}/`)
          .then(() => {
            toast.success("Xóa nhiệm vụ thành công!");
            setListProject((prevList) =>
              prevList.filter((item) => item.id !== id)
            );
          })
          .catch(() => {
            toast.error("Không thể xóa nhiệm vụ");
          });
      };

      toast(
        <div className="flex flex-col items-start space-y-2">
          <p>Bạn có chắc chắn muốn xóa nhiệm vụ này?</p>
          <button
            onClick={confirmDelete}
            className="bg-red-600 text-white px-4 py-2 rounded shadow-lg bg-opacity-80 hover:bg-red-700 transition"
          >
            Xóa
          </button>
        </div>,
        {
          position: "bottom-right",
          autoClose: false,
          closeOnClick: true,
          draggable: false,
        }
      );
    },
    []
  );

  const getProjects = useCallback(async (url: string) => {
    try {
      const { data } = await apiClient.get(url);
      const newData = data.filter((item: Item) => item.type !== "personal");
      newData.forEach((item: Item, index: number) => {
        item.index = index;
        item.isEditing = false;
      });
      setListProject(newData);
    } catch {
      toast.error("Lấy dữ liệu không thành công");
    }
  }, []);

  useEffect(() => {
    getProjects(current.url);
  }, [current, getProjects, reloadTableData]);

  const handleCreateAndSaveItem = async () => {
    if (!isCreating) {
      const newItem: Item = {
        id: Date.now(), // Assign a unique temporary ID
        index: listProject.length,
        type: "task",
        title: null,
        description: null,
        beginTime: null,
        endTime: null,
        progress: 0,
        manager: null,
        parentId: current.id || null,
        isEditing: true,
      };
      const newListProject = [...listProject, newItem];
      setListProject(newListProject);
      setIsCreating(true);
    } else {
      try {
        const response = await apiClient.post("project/", listProject[listProject.length - 1]);
        // Assuming the backend returns the created item with a unique ID
        const createdItem: Item = response.data;
        setListProject((prevList) =>
          prevList.map((item) =>
            item.id === listProject[listProject.length - 1].id ? createdItem : item
          )
        );
        toast.success("Tạo mới nhiệm vụ thành công!");
        setIsCreating(false);
        getProjects(current.url); // Refresh table
      } catch {
        toast.error("Không thể tạo mới task");
      }
    }
  };

  // Function to handle progress updates
  const handleUpdateProgress = useCallback(
    async (id: number, progress: number) => {
      try {
        await apiClient.patch(`project/${id}/`, { progress });
        setListProject((prevList) =>
          prevList.map((item) =>
            item.id === id ? { ...item, progress } : item
          )
        );
        toast.success("Cập nhật tiến độ thành công!");
      } catch {
        toast.error("Cập nhật tiến độ không thành công");
      }
    },
    []
  );

  // Handle header click for sorting
  const handleSort = (column: keyof Item) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };


  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table
          className="min-w-full bg-white border-separate border-spacing-y-2"
          style={{ borderSpacing: "0 5px" }}
        >
          <thead>
            <tr className="bg-gray-200 text-gray-800 uppercase text-sm leading-normal">
              {/* Update headers to buttons */}
              <th className="py-3 px-6 text-left">
                <button onClick={() => handleSort("type")} className="flex items-center">
                  Loại
                  {sortColumn === "type" && (sortDirection === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th className="py-3 px-6 text-left">
                <button onClick={() => handleSort("title")} className="flex items-center">
                  Tiêu đề
                  {sortColumn === "title" && (sortDirection === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              {/* Hide 'Description' header on small screens */}
              <th className="py-3 px-6 text-left hidden md:table-cell">
                <button onClick={() => handleSort("description")} className="flex items-center">
                  Nội dung
                  {sortColumn === "description" && (sortDirection === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th className="py-3 px-6 text-left">
                <button onClick={() => handleSort("beginTime")} className="flex items-center">
                  Ngày bắt đầu
                  {sortColumn === "beginTime" && (sortDirection === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th className="py-3 px-6 text-left">
                <button onClick={() => handleSort("endTime")} className="flex items-center">
                  Ngày Kết thúc
                  {sortColumn === "endTime" && (sortDirection === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th className="py-3 px-6 text-left">
                <button onClick={() => handleSort("progress")} className="flex items-center">
                  Tình trạng
                  {sortColumn === "progress" && (sortDirection === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th className="py-3 px-6 text-left">
                <button onClick={() => handleSort("manager")} className="flex items-center">
                  Phụ trách
                  {sortColumn === "manager" && (sortDirection === "asc" ? " ↑" : " ↓")}
                </button>
              </th>
              <th className="py-3 px-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-sm font-light">
            {sortedListProject.map((item: Item) => (
              <TableRow
                key={item.id}
                item={item}
                managerNames={Array.isArray(item.managerNames) ? item.managerNames : []} // Pass managerNames
                handleChange={handleChange}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
                setHistory={setHistory}
                setReloadTableData={setReloadTableData}
                handleUpdateProgress={handleUpdateProgress}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-6 bg-gray-100 flex justify-center">
        <button
          className="p-2 bg-blue-500 text-white border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
          onClick={handleCreateAndSaveItem}
          aria-label={isCreating ? "Save" : "Create"}
        >
          {isCreating ? <FiSave className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
