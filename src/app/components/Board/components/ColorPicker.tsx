import React, { useState } from 'react';
import { FiDroplet } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';

interface ColorPickerProps {
  color: string | null | undefined;
  onChange: (color: string | null) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#64748b', '#6b7280', '#4b5563',
    '#374151', '#1f2937', '#111827', '#030712'
  ];

  return (
    <>
      <button
        className="p-1.5 bg-[var(--muted)] hover:bg-[var(--muted-foreground)]
                  text-[var(--foreground)] rounded-full transition-all"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        style={{ color: color || 'var(--foreground)' }}
      >
        <FiDroplet className="w-4 h-4" />
      </button>

      <Dialog 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl w-[320px]">
            <Dialog.Title className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
              Chọn màu
            </Dialog.Title>

            <div className="grid grid-cols-6 gap-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption}
                  className="w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: colorOption,
                    borderColor: color === colorOption ? 'white' : 'transparent',
                    boxShadow: color === colorOption ? '0 0 0 2px rgb(59 130 246)' : 'none'
                  }}
                  onClick={() => {
                    onChange(colorOption);
                    setIsOpen(false);
                  }}
                />
              ))}
              {/* Nút xóa màu */}
              <button
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:scale-110 
                          transition-transform flex items-center justify-center bg-white dark:bg-gray-800"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
              >
                ❌
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default ColorPicker;
