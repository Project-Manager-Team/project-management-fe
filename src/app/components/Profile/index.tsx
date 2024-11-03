"use client";
import React, { useState, useEffect, useRef } from "react"; // Added React import
import Image from 'next/image';
import { FaArrowAltCircleLeft, FaUserCircle } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { toast } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css";
import apiClient from "@/utils";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  email: string;
  avatar: string; // Added avatar property
}

const backendUrl = "http://localhost:8000"; // Ensure this matches your Django backend URL

function Profile() {
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [changePass, setChangePass] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPassword2, setNewPassword2] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null); // New state for selected avatar
  const AvatarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Added ref for file input
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await apiClient.get("/user/detail/");
        const avatarResponse = await apiClient.get("/user/avatar/");
        let avatarUrl = avatarResponse.data.avatar;

        // If avatarUrl is not an absolute URL, prepend backendUrl
        if (!avatarUrl.startsWith('http')) {
          avatarUrl = `${backendUrl}${avatarUrl}`;
        }

        setUser({ 
          ...response.data, 
          avatar: avatarUrl 
        });
      } catch {
        toast.error("Failed to fetch user details");
      }
    };
    getUser();
  }, []);

  const handleButtonChangePassword = async () => {
    if (newPassword !== newPassword2) {
      toast.error("Mật khẩu không khớp");
    } else if (newPassword.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
    } else if (newPassword === oldPassword) {
      toast.error("Mật khẩu mới không được trùng với mật khẩu cũ");
    } else if (newPassword === newPassword2 && newPassword.length >= 8) {
      await changePassword();
    }
  };

  const changePassword = async () => {
    try {
      const response = await apiClient.post("/user/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      if (response.status !== 200) {
        throw new Error("Đổi mật khẩu thất bại");
      }
      toast.success("Đổi mật khẩu thành công");
    } catch {
      toast.error("Đổi mật khẩu thất bại");
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedAvatar(file);

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await apiClient.post(
          "/user/profile/update-avatar/",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        let avatarUrl = response.data.avatar;

        // If avatarUrl is not an absolute URL, prepend backendUrl
        if (!avatarUrl.startsWith('http')) {
          avatarUrl = `${backendUrl}${avatarUrl}`;
        }

        setUser(prevUser => prevUser ? { ...prevUser, avatar: avatarUrl } : null);
        toast.success("Avatar updated successfully");
      } catch {
        toast.error("Failed to update avatar");
      }
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/login");
  };

  const handleShowInfo = () => {
    setShowInfo(!showInfo);
    setChangePass(false);
  };

  const handleChangePass = () => {
    setChangePass(true);
  };

  const handleBackInfo = () => {
    setChangePass(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      AvatarRef.current &&
      !AvatarRef.current.contains(event.target as Node)
    ) {
      setShowInfo(false);
      setChangePass(false); // Hide the form when clicking outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleButtonChangePassword();
  };

  const handlePanelAvatarClick = () => {
    fileInputRef.current?.click(); // Trigger file input click from panel
  };

  return (
    <>
      {/* <ToastContainer /> */} {/* Loại bỏ dòng này */}
      <div className="relative" ref={AvatarRef}>
        <div className="cursor-pointer" onClick={handleShowInfo}>
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt="Avatar"
              width={48} // Increased width from 32 to 48
              height={48} // Increased height from 32 to 48
              className="rounded-full" // Removed "w-8 h-8"
              priority // Add this line
            />
          ) : (
            <RxAvatar className="text-3xl text-gray-700 hover:text-blue-600" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          ref={fileInputRef} // Added ref to input
          style={{ display: "none" }} // Hide the input
        />
        {!changePass ? (
          <div>
            {showInfo && (
              <div className="absolute right-0 mt-2 w-64 md:w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50 transform transition-all duration-300 ease-in-out"> {/* Changed width to 80% of w-80 and w-96 */}
                {" "}
                {/* Changed background to white */}
                <div className="flex flex-col items-center mb-4">
                  {user?.avatar ? (
                    <div
                      className="cursor-pointer"
                      onClick={handlePanelAvatarClick}
                    >
                      {" "}
                      {/* Make panel avatar clickable */}
                      <Image
                        src={user.avatar}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="rounded-full mb-2"
                        loading="eager" // Added loading attribute
                        priority // Add this line
                      />
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={handlePanelAvatarClick}
                    >
                      {" "}
                      {/* Make panel avatar clickable */}
                      <FaUserCircle className="text-5xl text-gray-700 mb-2" />
                    </div>
                  )}
                  {/* Added Username and Email Display */}
                  <div className="text-center mt-2">
                    <p className="font-semibold text-gray-600">
                      {user?.username}
                    </p>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>
                {/* Removed visible file input */}
                <button
                  onClick={handleChangePass}
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors duration-200 active:bg-blue-700 shadow-md"
                >
                  Đổi mật khẩu
                </button>
                <button
                  onClick={handleSignOut}
                  className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors duration-200 active:bg-red-700 shadow-md"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute right-0 mt-2 w-64 md:w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50 transform transition-all duration-300 ease-in-out">
            {" "}
            {/* Changed background to white */}
            <div className="flex items-center mb-4">
              <FaArrowAltCircleLeft
                onClick={handleBackInfo}
                className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors text-xl mr-3"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                {" "}
                {/* Changed text color */}
                Đổi Mật Khẩu
              </h3>
            </div>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                name="username"
                value={user?.username || ""}
                readOnly
                hidden
                autoComplete="username"
              />
              <input
                type="password"
                placeholder="Mật khẩu cũ"
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-2 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-black" /* Changed text color */
                autoComplete="off"
                required
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-3 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-black" /* Changed text color */
                autoComplete="new-password"
                required
              />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                onChange={(e) => setNewPassword2(e.target.value)}
                className="mt-3 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-black" /* Changed text color */
                autoComplete="new-password"
                required
              />
              <button
                type="submit"
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors duration-200 active:bg-blue-700 shadow-md"
              >
                Đổi mật khẩu
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;