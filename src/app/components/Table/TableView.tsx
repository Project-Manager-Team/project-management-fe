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
    <div className={`${items.length > 0 ? 'overflow-x-auto' : ''}`}>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-[var(--input)] text-[var(--foreground)]">
            <th className="py-3 px-6 text-left">
              <span>{COLUMNS.type.label}</span>
            </th>
            {selectedColumns
              .filter(colId => colId !== 'type')
              .map(colId => 
                COLUMNS[colId as keyof typeof COLUMNS] && (
                  <th key={colId} className="py-3 px-6 text-left">
                    {COLUMNS[colId as keyof typeof COLUMNS].label}
                  </th>
                )
            )}
            <th className="py-3 px-6 text-right">
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