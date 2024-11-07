"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { FaArrowAltCircleLeft, FaUserCircle } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "@/app/utils/utils";
import { useRouter } from "next/navigation";
import { DOMAIN } from "@/app/config/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordInputs,
} from "@/app/schemas/form";

interface User {
  username: string;
  email: string;
  avatar?: string;
}

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isVisible, setIsVisible] = useState({
    showInfo: false,
    changePass: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInputs>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const [userResponse, avatarResponse] = await Promise.all([
          apiClient.get("/api/user/detail/"),
          apiClient.get("/api/user/avatar/"),
        ]);
        let avatarUrl = avatarResponse.data.avatar;
        if (avatarUrl && !avatarUrl.startsWith("http")) {
          avatarUrl = `${DOMAIN}${avatarUrl}`;
        }
        setUser({ ...userResponse.data, avatar: avatarUrl || "" });
      } catch {
        toast.error("Failed to fetch user details");
      }
    };
    getUser();
  }, []);

  const onSubmit = async (data: ChangePasswordInputs) => {
    try {
      await apiClient.post("/api/user/change-password/", {
        old_password: data.oldPassword,
        new_password: data.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      reset();
      setIsVisible((prev) => ({ ...prev, changePass: false }));
    } catch {
      toast.error("Đổi mật khẩu thất bại");
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        processAndUploadImage(file);
      }, 500); // Debounce by 500ms
    }
  };

  const processAndUploadImage = useCallback(
    async (file: File) => {
      const image = new window.Image(); // Use the browser's native Image object
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          image.src = e.target.result as string;
        }
      };

      image.onload = async () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(image.width, image.height); // Use the smaller dimension for the square size
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#ffffff"; // Màu nền trắng
          ctx.fillRect(0, 0, size, size);
          const x =
            image.width > image.height ? (image.width - image.height) / 2 : 0;
          const y =
            image.height > image.width ? (image.height - image.width) / 2 : 0;
          ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
        }

        canvas.toBlob(async (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append("avatar", blob, "avatar.jpeg");
            try {
              const response = await apiClient.post(
                "/api/user/profile/update-avatar/",
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );
              let avatarUrl = response.data.avatar;
              if (avatarUrl && !avatarUrl.startsWith("http")) {
                avatarUrl = `${DOMAIN}${avatarUrl}`;
              }
              setUser((prevUser) =>
                prevUser ? { ...prevUser, avatar: avatarUrl } : null
              );
              toast.success("Avatar updated successfully");
            } catch {
              toast.error("Failed to update avatar");
            }
          }
        }, "image/jpeg");
      };

      reader.readAsDataURL(file);
    },
    [DOMAIN]
  );

  const handleSignOut = () => {
    sessionStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !(event.target as HTMLElement).closest(
          ".profile-dropdown, .profile-avatar"
        )
      ) {
        setIsVisible({ showInfo: false, changePass: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handlePanelAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="relative profile-avatar">
        <div
          className="cursor-pointer"
          onClick={() =>
            setIsVisible((prev) => ({ ...prev, showInfo: !prev.showInfo }))
          }
        >
          {user?.avatar ? (
            <Image
              src={
                user.avatar.startsWith("http")
                  ? user.avatar
                  : `${DOMAIN}${user.avatar}`
              }
              alt="Avatar"
              width={36}  // Reduced from 48
              height={36} // Reduced from 48
              className="rounded-full"
              priority
            />
          ) : (
            <RxAvatar className="text-3xl text-gray-700 hover:text-blue-600" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarSelect}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        {!isVisible.changePass ? (
          <div>
            {isVisible.showInfo && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 transform transition-all duration-300 ease-in-out profile-dropdown">
                <div className="flex flex-col items-center mb-3">
                  {user?.avatar ? (
                    <div
                      className="cursor-pointer"
                      onClick={handlePanelAvatarClick}
                    >
                      <Image
                        src={
                          user.avatar.startsWith("http")
                            ? user.avatar
                            : `${DOMAIN}${user.avatar}`
                        }
                        alt="Avatar"
                        width={60}  // Reduced from 80
                        height={60} // Reduced from 80
                        className="rounded-full mb-2"
                        loading="eager"
                        priority
                      />
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={handlePanelAvatarClick}
                    >
                      <FaUserCircle className="text-5xl text-gray-700 mb-2" />
                    </div>
                  )}
                  <div className="text-center mt-2">
                    <p className="font-semibold text-gray-600">
                      {user?.username}
                    </p>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setIsVisible((prev) => ({ ...prev, changePass: true }))
                  }
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200 active:bg-blue-700 shadow-md text-sm"
                >
                  Đổi mật khẩu
                </button>
                <button
                  onClick={handleSignOut}
                  className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200 active:bg-red-700 shadow-md text-sm"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 transform transition-all duration-300 ease-in-out profile-dropdown">
            <div className="flex items-center mb-4">
              <FaArrowAltCircleLeft
                onClick={() =>
                  setIsVisible((prev) => ({ ...prev, changePass: false }))
                }
                className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors text-xl mr-3"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                Đổi Mật Khẩu
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="text"
                name="username"
                value={user?.username || ""}
                readOnly
                hidden
                autoComplete="username"
              />

              <div className="space-y-3">
                <div>
                  <input
                    type="password"
                    placeholder="Mật khẩu cũ"
                    {...register("oldPassword")}
                    className="mt-2 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-black text-sm"
                    autoComplete="current-password"
                  />
                  {errors.oldPassword && (
                    <span className="text-xs text-red-500">
                      {errors.oldPassword.message}
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    {...register("newPassword")}
                    className="mt-3 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-black text-sm"
                    autoComplete="new-password"
                  />
                  {errors.newPassword && (
                    <span className="text-xs text-red-500">
                      {errors.newPassword.message}
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    {...register("newPassword2")}
                    className="mt-3 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-black text-sm"
                    autoComplete="new-password"
                  />
                  {errors.newPassword2 && (
                    <span className="text-xs text-red-500">
                      {errors.newPassword2.message}
                    </span>
                  )}
                </div>
              </div>

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
