import { useState, useRef, useEffect } from 'react';
import { FiCircle } from 'react-icons/fi';
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  color: string | undefined;
  onChange: (color: string) => void;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        className="p-1.5 bg-[var(--muted)] hover:bg-[var(--muted-foreground)]
                  text-[var(--foreground)] rounded-full transition-all"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Change color"
      >
        <FiCircle 
          className="w-4 h-4"
          style={{ color: color || 'currentColor' }}
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-8 z-50">
          <HexColorPicker
            color={color || '#aabbcc'}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
