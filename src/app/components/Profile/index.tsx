"use client";
import React, { useState, useEffect, useRef } from "react"; // Added React import
import { FaArrowAltCircleLeft, FaUserCircle } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css";
import apiClient from "@/utils";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  email: string;
}

function Profile() {
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [changePass, setChangePass] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPassword2, setNewPassword2] = useState<string>("");
  const AvatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await apiClient.get("/user/detail/");
        setUser(response.data);
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

  return (
    <>
      {/* <ToastContainer /> */} {/* Loại bỏ dòng này */}
      <div className="relative" ref={AvatarRef}>
        <div className="cursor-pointer">
          <RxAvatar
            onClick={handleShowInfo}
            className="text-3xl text-gray-700 hover:text-blue-600"
          />
        </div>
        {!changePass ? (
          <div>
            {showInfo && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50 transform transition-all duration-300 ease-in-out"> {/* Changed background to white */}
                <div className="flex flex-col items-center mb-4">
                  <FaUserCircle className="text-5xl text-gray-700 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-800"> {/* Changed text color */}
                    {user?.username}
                  </h3>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                </div>
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
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50 transform transition-all duration-300 ease-in-out"> {/* Changed background to white */}
            <div className="flex items-center mb-4">
              <FaArrowAltCircleLeft
                onClick={handleBackInfo}
                className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors text-xl mr-3"
              />
              <h3 className="text-lg font-semibold text-gray-800"> {/* Changed text color */}
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
