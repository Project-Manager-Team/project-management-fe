import React, { memo, useCallback } from "react";
import { FiCheckSquare, FiFolder } from "react-icons/fi";
import { Item, TableRowProps } from "@/app/components/Board/types/board";
import { formatDateTime } from "@/app/utils/formatDateTime";
import OwnerButton from "./OwnerButton";
import EditableContent from "@/app/components/common/EditableContent";
import { getDiffLevelStyle, getDiffLevelLabel } from "../utils/tableViewUtils";

const TableCell = memo(({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`p-3 align-middle ${className}`}>{children}</td>
));

TableCell.displayName = "TableCell";

const TableRow = ({
  item,
  handleChange,
  handleUpdateProgress,
  openManagers,
  selectedColumns,
  handleNavigateToChild,
  onContextMenu,
}: TableRowProps) => {
  const dateTimeInputClass = `w-[160px] rounded-lg transition-colors
    ${
      item.isEditing
        ? "bg-yellow-50 dark:bg-yellow-900 border border-blue-500"
        : "bg-[var(--background)]"
    } focus:outline-none focus:ring-0 text-[var(--foreground)]`;

  const handleCheckboxChange = useCallback(() => {
    const newProgress = item.progress === 100 ? 0 : 100;
    handleUpdateProgress(item.id ?? 0, newProgress);
  }, [item.progress, item.id, handleUpdateProgress]);

  // Render table row
  return (
    <tr
      className="hover:bg-[var(--muted)]
                [&>td:first-child]:rounded-md [&>td:last-child]:rounded-md
                bg-[var(--card)] border-2 border-solid text-sm"
      style={{
        borderColor: item.color || "var(--border)",
      }}
      onContextMenu={onContextMenu}
    >
      {/* Type column is always shown */}
      <TableCell>
        <button
          className="p-1.5 bg-[var(--input)] hover:bg-opacity-80 text-[var(--foreground)] 
                   rounded-md transition-all"
          onClick={() => handleNavigateToChild(item)}
          style={{ color: item.color || "var(--foreground)" }}
        >
          {item.type.toLowerCase() === "task" ? (
            <FiCheckSquare className="w-4 h-4" />
          ) : (
            <FiFolder className="w-4 h-4" />
          )}
        </button>
      </TableCell>
      {/* Other columns are toggleable */}
      {selectedColumns.map((colId) => {
        switch (colId) {
          case "title":
            return (
              <TableCell key={colId}>
                {" "}
                {/* Changed from min-w to max-w */}
                <div className="overflow-hidden">
                  <EditableContent
                    isEditing={item.isEditing}
                    value={item.title}
                    name="title"
                    onChange={(e) =>
                      handleChange(
                        item.index,
                        "title" as keyof Item,
                        e.target.value
                      )
                    }
                    className="w-full text-sm rounded-lg truncate" // Added truncate
                  />
                </div>
              </TableCell>
            );
          case "description":
            return (
              <TableCell key={colId} className="hidden md:table-cell max-w-[300px]">
                {" "}
                {/* Added max-w */}
                <div className="overflow-hidden">
                  <EditableContent
                    isEditing={item.isEditing}
                    value={item.description}
                    name="description"
                    onChange={(e) =>
                      handleChange(
                        item.index,
                        "description" as keyof Item,
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg line-clamp-2" // Added line-clamp-2 for 2 lines max
                  />
                </div>
              </TableCell>
            );
          case "beginTime":
            return (
              <TableCell key={colId} className="w-[160px] min-w-[160px]">
                {item.isEditing ? (
                  <EditableContent
                    isEditing={true}
                    value={
                      item.beginTime ? item.beginTime.substring(0, 16) : ""
                    }
                    name="beginTime"
                    type="datetime-local"
                    onChange={(e) =>
                      handleChange(
                        item.index,
                        "beginTime" as keyof Item,
                        e.target.value
                      )
                    }
                    className={dateTimeInputClass}
                  />
                ) : (
                  item.beginTime && (
                    <div className="text-[var(--foreground)]">
                      <span>{formatDateTime(item.beginTime).time}</span>
                      <br />
                      <span>{formatDateTime(item.beginTime).date}</span>
                    </div>
                  )
                )}
              </TableCell>
            );
          case "endTime":
            return (
              <TableCell key={colId} className="w-[160px] min-w-[160px]">
                {item.isEditing ? (
                  <EditableContent
                    isEditing={true}
                    value={item.endTime ? item.endTime.substring(0, 16) : ""}
                    name="endTime"
                    type="datetime-local"
                    onChange={(e) =>
                      handleChange(
                        item.index,
                        "endTime" as keyof Item,
                        e.target.value
                      )
                    }
                    className={dateTimeInputClass}
                  />
                ) : (
                  item.endTime && (
                    <div className="text-[var(--foreground)]">
                      <span>{formatDateTime(item.endTime).time}</span>
                      <br />
                      <span>{formatDateTime(item.endTime).date}</span>
                    </div>
                  )
                )}
              </TableCell>
            );
          case "owner":
            return (
              <TableCell key={colId}>
                <OwnerButton
                  owner={item.owner}
                  managersCount={item.managersCount}
                  onClick={() => openManagers(item)}
                />
              </TableCell>
            );
          case "diffLevel":
            return (
              <TableCell key={colId}>
                {item.isEditing ? (
                  <select
                    name="diffLevel"
                    className={`input-field w-full ${
                      item.isEditing
                        ? "bg-yellow-50 dark:bg-yellow-900 border border-blue-500"
                        : "bg-transparent"
                    } focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200 rounded-lg p-2`}
                    value={item.diffLevel === null ? "1" : item.diffLevel}
                    onChange={(e) =>
                      handleChange(
                        item.index,
                        e.target.name as keyof Item,
                        e.target.value ? parseInt(e.target.value) : 1
                      )
                    }
                    disabled={!item.isEditing}
                  >
                    <option value="1">Dễ</option>
                    <option value="2">Trung bình</option>
                    <option value="3">Khó</option>
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getDiffLevelStyle(
                      item.diffLevel
                    )}`}
                  >
                    {getDiffLevelLabel(item.diffLevel)}
                  </span>
                )}
              </TableCell>
            );
          case "progress":
            return (
              <TableCell key={colId}>
                {item.type.toLowerCase() === "task" ? (
                  <input
                    type="checkbox"
                    checked={item.progress === 100}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-600"
                    aria-label="Mark as complete"
                  />
                ) : (
                  <div className="w-full bg-gray-300 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${item.progress}%` }}
                      aria-label={`Progress: ${item.progress}%`}
                    ></div>
                  </div>
                )}
              </TableCell>
            );
          default:
            return null;
        }
      })}
    </tr>
  );
};

export default memo(TableRow);
