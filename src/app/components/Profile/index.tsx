"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import apiClient from "@/app/utils/apiClient";
import { DOMAIN } from "@/app/config/api";
import { AvatarDisplay } from "./AvatarDisplay";
import { LoginRegisterForm } from "./LoginRegisterForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfileDropdown } from "./ProfileDropdown";
import { User, ProfileState } from "@/app/types/profile";
import { useAppStore } from '@/app/store/appStore';

const initialProfileState: ProfileState = {
  showInfo: false,
  changePass: false,
  showLogin: false,
};

const Profile = () => {
  const resetToHome = useAppStore((state) => state.resetToHome);
  const [user, setUser] = useState<User | null>(null);
  const [isVisible, setIsVisible] = useState<ProfileState>(initialProfileState);
  const [isRegister, setIsRegister] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchUserData = async () => {
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
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        processAndUploadImage(file);
      }, 500);
    }
  };

  const processAndUploadImage = useCallback(async (file: File) => {
    const image = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        image.src = e.target.result as string;
      }
    };

    image.onload = async () => {
      const canvas = document.createElement("canvas");
      const size = Math.min(image.width, image.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#ffffff";
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
  }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    setIsVisible(initialProfileState);
    resetToHome();
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsVisible(initialProfileState);
        setIsRegister(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user)
    return (
      <div className="relative profile-avatar" ref={profileRef}>
        <AvatarDisplay
          onClick={() =>
            setIsVisible((prev) => ({ ...prev, showLogin: !prev.showLogin }))
          }
        />
        {isVisible.showLogin && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            <LoginRegisterForm
              isRegister={isRegister}
              toggleRegisterMode={() => setIsRegister(!isRegister)}
              onSuccess={() => {
                fetchUserData();
                setIsVisible((prev) => ({ ...prev, showLogin: false }));
                resetToHome();
              }}
            />
          </div>
        )}
      </div>
    );

  return (
    <div className="relative profile-avatar" ref={profileRef}>
      <AvatarDisplay
        avatar={user.avatar}
        onClick={() =>
          setIsVisible((prev) => ({ ...prev, showInfo: !prev.showInfo }))
        }
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleAvatarSelect}
      />
      {isVisible.showInfo && !isVisible.changePass && (
        <ProfileDropdown
          user={user}
          onChangePassword={() =>
            setIsVisible((prev) => ({ ...prev, changePass: true }))
          }
          onSignOut={handleSignOut}
          onAvatarClick={() => fileInputRef.current?.click()}
        />
      )}
      {isVisible.changePass && (
        <ChangePasswordForm
          username={user.username}
          onBack={() =>
            setIsVisible((prev) => ({ ...prev, changePass: false }))
          }
        />
      )}
    </div>
  );
};

export default Profile;
