import { FiUser } from "react-icons/fi";
import { ManagerButtonProps } from "@/app/types/table";

export const ManagerButton: React.FC<ManagerButtonProps> = ({ onClick, managersCount }) => {
  return (
    <button
      className="relative p-2 bg-blue-500 text-white border-none rounded-full cursor-pointer shadow-md transition-transform transform hover:translate-y-[-3px] active:translate-y-3 flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Show Managers"
    >
      <FiUser className="w-5 h-5" />
      {managersCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
          {managersCount}
        </span>
      )}
    </button>
  );
};

export default ManagerButton;
