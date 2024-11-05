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

interface Column {
  id: string;
  label: string;
}

const allColumns: Column[] = [
  { id: "type", label: "Lo���i" },
  { id: "title", label: "Tiêu đề" },
  { id: "description", label: "Nội dung" },
  { id: "beginTime", label: "Ngày bắt đầu" },
  { id: "endTime", label: "Ngày Kết thúc" },
  { id: "owner", label: "Người sở hữu" },
  { id: "progress", label: "Tình trạng" },
];

export default function Table({
  current,
  setHistory,
  reloadTableData,
  setReloadTableData,
}: TableProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [listProject, setListProject] = useState<Item[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(allColumns.map(col => col.id));
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState<boolean>(false); // New state

  const toggleColumn = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

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

    const itemToDelete = listProject.find((item) => item.id === id);
    const isNewItem = isCreating && itemToDelete && itemToDelete.id === listProject[listProject.length - 1].id;

    const confirmDelete = () => {
      if (isNewItem) {
        setListProject((prevList) => prevList.filter((item) => item.id !== id));
        setIsCreating(false);
        toast.success("Đã xoá nhiệm vụ mới tạo!");
      } else {
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
      }
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
        owner: null, // Initialize owner as null
      };
      const newListProject = [...listProject, newItem];
      setListProject(newListProject);
      setIsCreating(true);
    } else {
      const newItem = listProject[listProject.length - 1];
      if (!newItem.title || newItem.title.trim() === "") {
        toast.error("Tiêu đề là bắt buộc");
        return;
      }
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
        toast.error("Không thể tạo mới nhiệm vụ");
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
      {/* Remove or comment out the existing Column Selection */}
      {/* ...existing code... */}

      <div className="overflow-x-auto">
        <table
          className="min-w-full bg-white border-separate border-spacing-y-2"
          style={{ borderSpacing: "0 5px" }}
        >
          <thead>
            <tr className="bg-gray-200 text-gray-800 uppercase text-sm leading-normal">
              {selectedColumns.includes("type") && (
                <th className="py-3 px-6 text-left flex items-center">
                  Loại
                  <button
                    onClick={() => setIsColumnSelectorOpen(true)}
                    className="ml-2 p-1 bg-gray-300 rounded hover:bg-gray-400"
                    aria-label="Chọn cột hiển thị"
                  >
                    &#9881;
                  </button>
                </th>
              )}
              {selectedColumns.includes("title") && (
                <th className="py-3 px-6 text-left">
                  Tiêu đề
                </th>
              )}
              {selectedColumns.includes("description") && (
                <th className="py-3 px-6 text-left hidden md:table-cell">Nội dung</th>
              )}
              {selectedColumns.includes("beginTime") && <th className="py-3 px-6 text-left">Ngày bắt đầu</th>}
              {selectedColumns.includes("endTime") && <th className="py-3 px-6 text-left">Ngày Kết thúc</th>}
              {selectedColumns.includes("owner") && <th className="py-3 px-6 text-left">Người sở hữu</th>}
              {selectedColumns.includes("progress") && <th className="py-3 px-6 text-left">Tình trạng</th>}
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
                selectedColumns={selectedColumns}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Column Selection Modal */}
      {isColumnSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Chọn cột hiển thị</h3>
            <div className="flex flex-col space-y-2">
              {allColumns.map((col) => (
                <label key={col.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col.id)}
                    onChange={() => toggleColumn(col.id)}
                    className="mr-2"
                  />
                  {col.label}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsColumnSelectorOpen(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Đóng
              </button>
              <button
                onClick={() => setIsColumnSelectorOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
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
