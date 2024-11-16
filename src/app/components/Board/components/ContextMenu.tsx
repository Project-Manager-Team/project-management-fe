import React, { useEffect, useRef, useState } from 'react';
import { FiEdit, FiTrash2, FiSave, FiUsers, FiDroplet, FiFileText } from 'react-icons/fi';
import { Item } from '../types/board';

interface Position {
  x: number;
  y: number;
}

interface ContextMenuProps {
  item: Item;
  position: Position;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManage: () => void;
  onColorChange: (color: string | null) => void;
  onGenerateReport: () => void; // Add this prop
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  item,
  position,
  onClose,
  onEdit,
  onDelete,
  onManage,
  onColorChange,
  onGenerateReport, // Add this prop
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    {
      icon: item.isEditing ? <FiSave /> : <FiEdit />,
      label: item.isEditing ? 'Lưu' : 'Sửa',
      onClick: onEdit,
    },
    {
      icon: <FiDroplet />,
      label: 'Màu sắc',
      onClick: () => setShowColorPicker(!showColorPicker),
    },
    {
      icon: <FiUsers />,
      label: 'Quản lý',
      onClick: onManage,
    },
    {
      icon: <FiFileText />,  // Add Report icon
      label: 'Xuất báo cáo',
      onClick: onGenerateReport,
    },
    {
      icon: <FiTrash2 />,
      label: 'Xóa',
      onClick: onDelete,
      className: 'text-red-500 hover:bg-red-50',
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 min-w-[160px]"
      style={{ top: position.y, left: position.x }}
    >
      {menuItems.map((menuItem, index) => (
        <button
          key={index}
          className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                     flex items-center gap-2 text-sm ${menuItem.className || ''}`}
          onClick={menuItem.onClick}
        >
          {menuItem.icon}
          {menuItem.label}
        </button>
      ))}

      {showColorPicker && (
        <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-4 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
            <button
              className="w-6 h-6 rounded-full border-2 border-gray-300 
                        hover:scale-110 transition-transform flex items-center justify-center"
              onClick={() => onColorChange(null)}
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;