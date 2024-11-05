import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FaTrashAlt } from "react-icons/fa";
import apiClient from "@/utils";
import { toast } from "react-toastify"; // Ensure ToastContainer is not imported here

interface NotificationProps {
  setReloadTableData: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Invitation {
  id: number;
  status: boolean | null;
  isReplied: boolean;
  content: string;
  title: string;
}

function Notification({ setReloadTableData }: NotificationProps) {
  const [notification, setNotification] = useState<boolean>(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]); 
  const [reloadAPI, setReloadAPI] = useState<boolean>(true);
  const notificationRef = useRef<HTMLDivElement>(null);

  const getInvitations = async () => {
    const response = await apiClient.get(`/api/invitation/`);
    return response.data;
  };

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const data = await getInvitations();
        const updatedData = data.reverse().map((item: Invitation) => ({
          ...item,
          isReplied: item.status !== null,
        }));
        setInvitations(updatedData);
      } catch {
        toast.error("Failed to fetch data");
      }
    };

    fetchApi();
  }, [reloadAPI]);

  const unreadCount = invitations.filter((inv) => !inv.isReplied).length;

  const handleShowNotification = () => {
    setNotification(!notification);
  };

  const editInvitation = async (item: Invitation, invitationID: number): Promise<void> => {
    await apiClient.patch(`/api/invitation/${invitationID}/`, item);
    setReloadAPI(!reloadAPI);
  };

  const handleReply = async (item: Invitation, status: boolean): Promise<void> => {
    item.status = status;
    item.isReplied = true;
    if (status === true) {
      item.content = "Bạn đã chấp nhận lời mời";
      setTimeout(() => {
        setReloadTableData((prev) => !prev);
      }, 200);
    } else {
      item.content = "Bạn đã từ chối lời mời";
    }
    await editInvitation(item, item.id);
  };

  const deleteInvitation = async (invitationID: number) => {
    try {
      const response = await apiClient.delete(`/api/invitation/${invitationID}/`);
      setReloadAPI(!reloadAPI);
      if (response.status !== 204) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch {
      toast.error("Failed to delete invitation");
    }
  };

  const handleDelete = async (item: Invitation) => {
    const confirmed = window.confirm("Bạn có muốn xóa không");
    if (confirmed) {
      await deleteInvitation(item.id).then(() =>
        toast.success("Bạn đã xóa thành công")
      );
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target as Node)
    ) {
      setNotification(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative mb-4" ref={notificationRef}> {/* Added ref to wrapper div */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faBell}
          onClick={handleShowNotification}
          className="cursor-pointer text-2xl p-1 rounded-full hover:bg-gray-200 hover:scale-110 active:scale-95" /* Changed hover background */
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
      {notification && (
        <div className="absolute right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg w-80 max-h-80 overflow-y-auto p-2 z-10"> {/* Changed background and border */}
          {invitations.map((item: Invitation) => (
            <div
              className="mb-2 p-2 relative bg-white shadow-md rounded" /* Changed background and added shadow */
              key={item.id}
            >
              <div className="font-bold mb-1 text-black">{item.title}</div> {/* Changed text color */}
              <div className="text-sm text-gray-800 mb-2">{item.content}</div> {/* Changed text color */}
              {!item.isReplied && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
                    if (submitter) {
                      const status = JSON.parse(submitter.value);
                      handleReply(item, status);
                    }
                  }}
                  className="flex space-x-2"
                >
                  <button
                    type="submit"
                    value="true"
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Chấp nhận
                  </button>
                  <button
                    type="submit"
                    value="false"
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Từ chối
                  </button>
                </form>
              )}
              <FaTrashAlt
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(item);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notification;
