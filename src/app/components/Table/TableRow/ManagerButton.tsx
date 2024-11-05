import React from "react";
import { FiUser } from "react-icons/fi";

interface ManagerButtonProps {
  onClick: () => void;
}

const ManagerButton: React.FC<ManagerButtonProps> = ({ onClick }) => {
  return (
    <>
      <button
        className="p-2 bg-blue-500 text-white border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          onClick();
        }}
        aria-label="Show Managers"
      >
        <FiUser className="w-5 h-5" />
      </button>
    </>
  );
};

export default ManagerButton;
