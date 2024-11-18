"use client";
import React, { useMemo, memo } from "react";
import TableRow from "./TableRow";
import { TableViewProps } from "@/app/components/Board/types/board";
import { COLUMNS } from "@/app/components/Board/constants/columns";

const TableHeader = memo(
  ({ selectedColumns }: { selectedColumns: string[] }) => (
    <tr className="bg-[var(--input)] text-[var(--foreground)] shadow-sm text-xs">
      <th className="p-3 text-left whitespace-nowrap rounded-bl-lg">
        <span className="text-xs font-medium">{COLUMNS.type.label}</span>
      </th>
      {selectedColumns.map(
        (colId) =>
          COLUMNS[colId as keyof typeof COLUMNS] && (
            <th key={colId} className="p-3 text-left whitespace-nowrap">
              <span className="text-xs font-medium">
                {COLUMNS[colId as keyof typeof COLUMNS].label}
              </span>
            </th>
          )
      )}
    </tr>
  )
);
TableHeader.displayName = "TableHeader";

const TableView: React.FC<TableViewProps> = ({
  items,
  selectedColumns,
  handleChange,
  handleEditItem,
  handleDeleteItem,
  handleUpdateProgress,
  openManagers,
  handleNavigateToChild,
  handleColorChange,
  setContextMenu, // Add this
}) => {
  const tableContent = useMemo(
    () => (
      <tbody>
        {items.length > 0 ? (
          items.map((item) => (
            <TableRow
              key={item.id ?? `new-item-${item.index}`}
              item={item}
              handleChange={handleChange}
              handleEditItem={handleEditItem}
              handleDeleteItem={handleDeleteItem}
              handleUpdateProgress={handleUpdateProgress}
              selectedColumns={selectedColumns}
              openManagers={openManagers}
              handleNavigateToChild={handleNavigateToChild}
              handleColorChange={handleColorChange}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  item,
                  position: { x: e.clientX, y: e.clientY },
                });
              }}
            />
          ))
        ) : (
          <tr>
            <td
              colSpan={selectedColumns.length + 2}
              className="py-8 text-center text-[var(--foreground)] text-sm"
            >
              Chưa có dữ liệu
            </td>
          </tr>
        )}
      </tbody>
    ),
    [items, selectedColumns]
  );

  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <div className="min-w-[800px] p-2 sm:p-0">
        <table className="w-full table-auto bg-[var(--background)] border-separate border-spacing-y-2 -mt-2">
          <thead className="sticky top-0 z-10">
            <TableHeader selectedColumns={selectedColumns} />
          </thead>
          {tableContent}
        </table>
      </div>
    </div>
  );
};

export default memo(TableView);
