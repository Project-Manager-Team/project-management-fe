import { FiUser } from "react-icons/fi";
import Image from "next/image";
import { DOMAIN } from "@/app/config/api";
import { OwnerButtonProps } from "@/app/components/Table/types/table";

const OwnerButton: React.FC<OwnerButtonProps> = ({
  owner,
  managersCount,
  onClick,
  size = "normal",
}) => {
  const sizeClasses =
    size === "small"
      ? "w-7 h-7" // Reduced from w-9 h-9
      : "w-8 h-8"; // Reduced from w-11 h-11

  const badgeClasses =
    size === "small"
      ? "px-1.5 py-0.5 text-xs min-w-[16px]" // Reduced min-width
      : "px-2 py-0.5 text-xs min-w-[20px]"; // Reduced padding and min-width

  const imageSize = size === "small" ? 20 : 24; // Reduced from 24/32

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`relative ${sizeClasses} flex items-center justify-center group 
                  transition-transform hover:scale-105`}
    >
      {/* Render owner image or placeholder */}
      {owner?.avatar ? (
        <div className="w-full h-full">
          <Image
            src={
              owner.avatar.startsWith("http")
                ? owner.avatar
                : `${DOMAIN}${owner.avatar}`
            }
            alt={owner.username || "User avatar"}
            width={imageSize}
            height={imageSize}
            className="w-full h-full object-cover rounded-full"
            unoptimized
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/default-avatar.png";
            }}
          />
        </div>
      ) : (
        <div className="rounded-full p-2 bg-gray-200 dark:bg-gray-700">
          <FiUser className="w-5 h-5" />
        </div>
      )}
      {/* Render managers count badge */}
      {managersCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 ${badgeClasses} bg-red-600 text-white rounded-full flex items-center justify-center`}
        >
          {managersCount}
        </span>
      )}
    </button>
  );
};

export default OwnerButton;
