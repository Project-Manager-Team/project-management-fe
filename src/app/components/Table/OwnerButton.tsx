import { FiUser } from 'react-icons/fi';
import Image from 'next/image';
import { DOMAIN } from '@/app/config/api';
import { OwnerButtonProps } from '@/app/types/table';

const OwnerButton: React.FC<OwnerButtonProps> = ({ 
  owner, 
  managersCount, 
  onClick,
  size = 'normal'
}) => {
  const sizeClasses = size === 'small' 
    ? "p-2 w-9 h-9" 
    : "p-2.5 w-11 h-11";

  const badgeClasses = size === 'small'
    ? "px-2 py-0.5 text-xs min-w-[20px]"
    : "px-2.5 py-1 text-sm min-w-[24px]";

  const imageSize = size === 'small' ? 24 : 32;

  return (
    <button
      className={`relative hover:bg-[var(--muted-foreground)]
                 text-[var(--foreground)] rounded-full 
                 cursor-pointer transition-colors
                 flex items-center justify-center ${sizeClasses}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={owner?.username || "No owner"}
    >
      {owner?.avatar ? (
        <Image
          src={owner.avatar.startsWith('http') ? owner.avatar : `${DOMAIN}${owner.avatar}`}
          alt={owner.username}
          width={imageSize}
          height={imageSize}
          className="rounded-full"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = "/default-avatar.png";
          }}
        />
      ) : (
        <div className="relative">
          <FiUser className={size === 'small' ? "w-5 h-5" : "w-6 h-6"} />
          <span className="absolute -bottom-1 -right-1 flex items-center justify-center 
                         bg-green-500 text-white rounded-full
                         text-xs font-bold leading-none">
            <svg className={size === 'small' ? "w-3 h-3" : "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </div>
      )}
      
      {managersCount > 0 && (
        <span className={`absolute -top-1 -right-1 
                       inline-flex items-center justify-center 
                       font-bold leading-none text-red-100 
                       bg-red-600 rounded-full ${badgeClasses}`}>
          {managersCount}
        </span>
      )}
      
      <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                     bg-black text-white text-xs rounded py-1 px-2 opacity-0 
                     group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {owner?.username || "Không có người sở hữu"}
      </span>
    </button>
  );
};

export default OwnerButton;