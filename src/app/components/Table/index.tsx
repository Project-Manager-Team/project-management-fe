"use client";
import { useState, useEffect } from "react";
import apiClient from "@/utils";
import { toast } from "react-toastify";
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

  const handleChange = (
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
  };

  const handleEditItem = async (index: number) => {
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
  };

  const handleDeleteItem = (id: number | null) => {
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
  };

  const getProjects = async (url: string) => {
    try {
      const { data } = await apiClient.get<Item[]>(url); // Specify the expected data type
      const newData = data.filter((item) => item.type !== "personal");
      newData.forEach((item, index) => {
        item.index = index;
        item.isEditing = false;
      });
      setListProject(newData);
    } catch {
      toast.error("Lấy dữ liệu không thành công");
    }
  };

  useEffect(() => {
    getProjects(current.url);
  }, [current.url, reloadTableData]);

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
        managers: [],
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
  const handleUpdateProgress = async (id: number, progress: number) => {
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
              <th className="py-3 px-6 text-left">Loại</th>
              <th className="py-3 px-6 text-left">Tiêu đề</th>
              <th className="py-3 px-6 text-left hidden md:table-cell">Nội dung</th>
              <th className="py-3 px-6 text-left">Ngày bắt đầu</th>
              <th className="py-3 px-6 text-left">Ngày Kết thúc</th>
              <th className="py-3 px-6 text-left">Tình trạng</th>
              <th className="py-3 px-6 text-left">Phụ trách</th>
              <th className="py-3 px-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-sm font-light">
            {listProject.map((item) => (
              <TableRow
                key={item.id}
                item={item}
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
