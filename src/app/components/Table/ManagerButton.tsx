import { FiUser } from "react-icons/fi";
import { ManagerButtonProps } from "@/app/types/table";

export const ManagerButton: React.FC<ManagerButtonProps> = ({ onClick, managersCount, size = 'normal' }) => {
  const sizeClasses = size === 'small' 
    ? "p-1.5 w-7 h-7" // Kích thước nhỏ hơn cho button
    : "p-2 w-9 h-9";

  const badgeClasses = size === 'small'
    ? "px-1.5 py-0.5 text-[10px]" // Badge nhỏ hơn
    : "px-2 py-1 text-xs";

  return (
    <button
      className={`relative bg-blue-500 text-white border-none rounded-full cursor-pointer shadow-sm hover:bg-blue-600 flex items-center justify-center ${sizeClasses}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Show Managers"
    >
      <FiUser className={size === 'small' ? "w-4 h-4" : "w-5 h-5"} />
      {managersCount > 0 && (
        <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center font-bold leading-none text-red-100 bg-red-600 rounded-full ${badgeClasses}`}>
          {managersCount}
        </span>
      )}
    </button>
  );
};

export default ManagerButton;
