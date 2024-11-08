import React, { useEffect, useMemo, useCallback } from "react";
import { Popover } from '@headlessui/react';
import { FaBell, FaTrashAlt } from "react-icons/fa";
import { useAppStore } from '@/app/store/appStore';
import { useNotificationStore, Invitation } from '@/app/store/notificationStore';
import { toast } from 'react-toastify'; // Add this import

const NotificationItem = React.memo(({ 
  item, 
  onReply, 
  onDelete 
}: { 
  item: Invitation; 
  onReply: (item: Invitation, status: boolean) => Promise<void>;
  onDelete: (item: Invitation) => Promise<void>;
}) => (
  <div className="mb-2 p-2 relative bg-white shadow-md rounded">
    <div className="font-bold mb-1 text-black">{item.title}</div>
    <div className="text-sm text-gray-800 mb-2">{item.content}</div>
    {!item.isReplied && (
      <div className="flex space-x-2">
        <button
          onClick={() => onReply(item, true)}
          className="bg-green-500 text-white px-2 py-1 rounded"
        >
          Chấp nhận
        </button>
        <button
          onClick={() => onReply(item, false)}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Từ chối
        </button>
      </div>
    )}
    <FaTrashAlt
      className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 cursor-pointer"
      onClick={() => onDelete(item)}
    />
  </div>
));

NotificationItem.displayName = 'NotificationItem';

function Notification() {
  const { setShouldReloadTable } = useAppStore();
  const { invitations, reloadTrigger, fetchInvitations, handleReply, handleDelete } = useNotificationStore();

  useEffect(() => {
    fetchInvitations();
    const interval = setInterval(fetchInvitations, 60000);
    return () => clearInterval(interval);
  }, [fetchInvitations, reloadTrigger]);

  const unreadCount = useMemo(() => 
    invitations.filter((inv) => !inv.isReplied).length,
    [invitations]
  );

  const onReply = async (item: Invitation, status: boolean) => {
    await handleReply(item, status);
    if (status) {
      setTimeout(() => setShouldReloadTable(true), 200);
    }
  };

  // Add confirmDelete function
  const confirmDelete = useCallback(async (item: Invitation): Promise<void> => {
    const ToastContent = (
      <div>
        <p>Bạn có muốn xóa không?</p>
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss();
              handleDelete(item);
            }}
            className="px-2 py-1 bg-red-500 text-white rounded"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-2 py-1 bg-gray-500 text-white rounded"
          >
            Hủy
          </button>
        </div>
      </div>
    );

    toast.info(ToastContent, {
      autoClose: false,
      closeButton: false,
      closeOnClick: false,
    });
  }, [handleDelete]);

  return (
    <Popover className="relative">
      {() => (
        <>
          <Popover.Button className="relative flex items-center outline-none">
            <FaBell className="text-2xl p-1 text-gray-400 hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Popover.Button>

          <Popover.Panel className="absolute right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg w-80 max-h-80 overflow-y-auto p-2 z-10">
            {invitations.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onReply={onReply}
                onDelete={confirmDelete} // Use confirmDelete here
              />
            ))}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
}

export default React.memo(Notification);
