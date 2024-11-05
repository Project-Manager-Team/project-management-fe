import React from "react";
import {Item} from './interfaces'
interface InviteModalProps {
  inviteUsername: string;
  setInviteUsername: React.Dispatch<React.SetStateAction<string>>;
  inviteTitle: string;
  setInviteTitle: React.Dispatch<React.SetStateAction<string>>;
  inviteContent: string;
  setInviteContent: React.Dispatch<React.SetStateAction<string>>;
  handleInvite: () => void;
  setShowInviteForm: React.Dispatch<React.SetStateAction<boolean>>;
  currentInviteItem: Item | null;
}

const InviteModal: React.FC<InviteModalProps> = ({
  inviteUsername,
  setInviteUsername,
  inviteTitle,
  setInviteTitle,
  inviteContent,
  setInviteContent,
  handleInvite,
  setShowInviteForm,
  currentInviteItem,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={() => setShowInviteForm(false)}
    >
      <div
        className="bg-white p-4 rounded-lg shadow-lg z-60 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">
          Tạo lời mời
        </h3>
        <input
          type="text"
          placeholder="Username"
          value={inviteUsername}
          onChange={(e) => setInviteUsername(e.target.value)}
          className={`w-full ${
            currentInviteItem?.isEditing
              ? "bg-yellow-50 border border-blue-500 text-yellow-800"
              : "bg-transparent text-yellow-800"
          } mb-2 p-2 border rounded`}
        />
        <input
          type="text"
          placeholder="Title"
          value={inviteTitle}
          onChange={(e) => setInviteTitle(e.target.value)}
          className={`w-full ${
            currentInviteItem?.isEditing
              ? "bg-yellow-50 border border-blue-500 text-yellow-800"
              : "bg-transparent text-yellow-800"
          } mb-2 p-2 border rounded`}
        />
        <textarea
          placeholder="Content"
          value={inviteContent}
          onChange={(e) => setInviteContent(e.target.value)}
          className={`w-full ${
            currentInviteItem?.isEditing
              ? "bg-yellow-50 border border-blue-500 text-yellow-800"
              : "bg-transparent text-yellow-800"
          } mb-2 p-2 border rounded`}
        />
        <button
          onClick={handleInvite}
          className="w-full bg-green-500 text-white p-2 rounded mt-2"
        >
          Gửi lời mời
        </button>
      </div>
    </div>
  );
};

export default InviteModal;
