import {
  FiCheckSquare,
  FiFolder,
  FiCheck,
} from "react-icons/fi";
import { Item, ItemProperty } from "@/app/components/Board/types/board";
import { CardViewProps } from "@/app/components/Board/types/board";
import { formatDateTime } from "@/app/utils/formatDateTime";
import EditableContent from "@/app/components/common/EditableContent";
import { getDiffLevelStyle, getDiffLevelLabel } from "../utils/tableViewUtils";
import OwnerButton from "./OwnerButton";

const CardView: React.FC<CardViewProps> = ({
  items,
  handleChange,
  handleUpdateProgress,
  handleNavigateToChild, // Add this prop
  setContextMenu, // Add this
  openManagers, // Add this prop
}) => {
  const handleContextMenu = (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    setContextMenu({
      item,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const renderDateContent = (dateString: string | null) => {
    if (!dateString) return null;
    const { date, time } = formatDateTime(dateString);
    return (
      <div className="flex flex-col">
        <span className="text-xs text-[var(--muted-foreground)]">{date}</span>
        <span className="text-sm font-medium text-[var(--foreground)]">
          {time}
        </span>
      </div>
    );
  };

  // Add this helper function
  const renderProgress = (item: Item) => {
    const isTask = !item.type || item.type.toLowerCase() === "task";
    if (isTask) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUpdateProgress(item.id ?? 0, item.progress === 100 ? 0 : 100);
          }}
          className={`p-1.5 rounded-lg transition-all flex items-center gap-2 text-sm
                     ${
                       item.progress === 100
                         ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                         : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                     }`}
        >
          <div
            className={`p-0.5 rounded ${
              item.progress === 100 ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <FiCheck className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-medium">
            {item.progress === 100 ? "Đã hoàn thành" : "Chưa hoàn thành"}
          </span>
        </button>
      );
    }

    return (
      <div className="flex grow items-center gap-2">
        <div className="flex-grow bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">
          {item.progress}%
        </span>
      </div>
    );
  };

  // const handleGenerateReport = async (item: Item) => {
  //   try {
  //     toast.info("Đang tạo báo cáo...");
  //     const report = await generateProjectReport(item);
  //     toast.success("Đã tạo báo cáo thành công!");
  //   } catch {
  //     toast.error("Không thể tạo báo cáo");
  //   }
  // };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
      {items.map((item) => (
        <div key={item.id ?? `new-item-${item.index}`} className="flex w-full">
          <div
            onClick={() => handleNavigateToChild(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
            className={`bg-[var(--card)] border rounded-md shadow-sm 
                   transition-all duration-200 flex flex-col w-full
                   ${!item.isEditing ? "hover:scale-[1.01] hover:shadow cursor-pointer" : ""}
                   ${item.isEditing ? "ring-1 ring-blue-500" : "hover:bg-[var(--accent)]"}`}
            style={{ borderColor: item.color || "var(--border)" }}
          >
            {/* Header */}
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {!item.type || item.type.toLowerCase() === "task" ? (
                    <FiCheckSquare
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: item.color || "currentColor" }}
                    />
                  ) : (
                    <FiFolder
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: item.color || "currentColor" }} // Thêm style này
                    />
                  )}
                  <EditableContent
                    isEditing={item.isEditing}
                    value={item.title}
                    name="title"
                    onChange={(e) =>
                      handleChange(
                        item.index,
                        "title" as ItemProperty,
                        e.target.value
                      )
                    }
                    className="text-sm font-medium text-[var(--foreground)] truncate"
                  />
                </div>
                <div className="flex-shrink-0">
                  <OwnerButton
                    owner={item.owner}
                    managersCount={item.managers?.length || 0}
                    onClick={() => openManagers(item)}
                    size="small"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            {(item.description || item.isEditing) && (
              <div className="px-3 sm:px-4 pb-3">
                <EditableContent
                  isEditing={item.isEditing}
                  value={item.description}
                  name="description"
                  type="textarea"
                  onChange={(e) =>
                    handleChange(
                      item.index,
                      "description" as ItemProperty,
                      e.target.value
                    )
                  }
                  className="text-xs text-[var(--muted-foreground)] line-clamp-2"
                />
              </div>
            )}

            {/* Dates section */}
            {(item.beginTime || item.endTime || item.isEditing) && (
              <div className="px-3 sm:px-4">
                <div className="grid sm:grid-cols-2 gap-3 p-2 bg-[var(--muted)] rounded">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      Bắt đầu
                    </span>
                    {item.isEditing ? (
                      <EditableContent
                        isEditing={item.isEditing}
                        value={
                          item.beginTime ? item.beginTime.substring(0, 16) : ""
                        }
                        name="beginTime"
                        type="datetime-local"
                        onChange={(e) =>
                          handleChange(
                            item.index,
                            "beginTime" as ItemProperty,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      renderDateContent(item.beginTime)
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      Kết thúc
                    </span>
                    {item.isEditing ? (
                      <EditableContent
                        isEditing={item.isEditing}
                        value={
                          item.endTime ? item.endTime.substring(0, 16) : ""
                        }
                        name="endTime"
                        type="datetime-local"
                        onChange={(e) =>
                          handleChange(
                            item.index,
                            "endTime" as ItemProperty,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      renderDateContent(item.endTime)
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-3 sm:p-4 mt-auto">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="w-24 flex-shrink-0">
                  {(item.diffLevel !== null || item.isEditing) &&
                    (item.isEditing ? (
                      <select
                        name="diffLevel"
                        value={item.diffLevel === null ? "1" : item.diffLevel}
                        onChange={(e) =>
                          handleChange(
                            item.index,
                            "diffLevel" as ItemProperty,
                            e.target.value ? parseInt(e.target.value) : 1
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-xs px-2 py-1 rounded-full bg-green-50 
                           dark:bg-gray-900 border border-blue-500 focus:outline-none"
                      >
                        <option value="1">Dễ</option>
                        <option value="2">Trung bình</option>
                        <option value="3">Khó</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-block w-full text-center text-xs px-2 py-1 
                                   rounded-full ${getDiffLevelStyle(
                                     item.diffLevel
                                   )}`}
                      >
                        {item.diffLevel !== null
                          ? getDiffLevelLabel(item.diffLevel)
                          : "Không xác định"}
                      </span>
                    ))}
                </div>
                <div className="flex-1 min-w-[200px]">
                  {renderProgress(item)}
                </div>
              </div>
            </div>
          </div>          
        </div>
      ))}
    </div>
  );
};

export default CardView;
