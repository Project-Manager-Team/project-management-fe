import React from 'react';
import { FaSignOutAlt, FaKey } from 'react-icons/fa';
import { ProfileDropdownProps } from '@/app/types/profile';
import { AvatarDisplay } from './AvatarDisplay';

export function ProfileDropdown({
  user,
  onChangePassword,
  onSignOut,
  onAvatarClick,
}: ProfileDropdownProps) {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div onClick={onAvatarClick} className="cursor-pointer">
            <AvatarDisplay avatar={user.avatar} size={40} />
          </div>
          <div>
            <div className="font-semibold dark:text-white">{user.username}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <button
          onClick={onChangePassword}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 rounded"
        >
          <FaKey className="text-gray-400" />
          <span>Đổi mật khẩu</span>
        </button>
        
        <button
          onClick={onSignOut}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 rounded"
        >
          <FaSignOutAlt className="text-gray-400" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
