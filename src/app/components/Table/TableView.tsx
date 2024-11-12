"use client";
import React from 'react';
import TableRow from './TableRow';
import {TableViewProps } from '@/app/types/table';
import { COLUMNS } from '@/app/constants/columns';

const TableView: React.FC<TableViewProps> = ({
  items,
  selectedColumns,
  handleChange,
  handleEditItem,
  handleDeleteItem,
  handleUpdateProgress,
  openManagers,
  isCreating, // Add this prop
  setIsCreating, // Add this prop
}) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full table-auto min-w-[800px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[var(--input)] text-[var(--foreground)]">
            {/* Type column is always shown */}
            <th className="p-3 text-left whitespace-nowrap">
              <span className="text-xs font-medium">{COLUMNS.type.label}</span>
            </th>
            {/* Other columns are toggleable */}
            {selectedColumns.map(colId => 
              COLUMNS[colId as keyof typeof COLUMNS] && (
                <th key={colId} className="p-3 text-left whitespace-nowrap">
                  <span className="text-xs font-medium">
                    {COLUMNS[colId as keyof typeof COLUMNS].label}
                  </span>
                </th>
              )
            )}
            <th className="p-3 text-right whitespace-nowrap">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow
                key={item.id}
                item={item}
                handleChange={handleChange}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
                handleUpdateProgress={handleUpdateProgress}
                selectedColumns={selectedColumns}
                openManagers={openManagers}
                isCreating={isCreating} // Pass isCreating to TableRow
                setIsCreating={setIsCreating} // Pass setIsCreating to TableRow
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
      </table>
    </div>
  );
};

export default TableView;