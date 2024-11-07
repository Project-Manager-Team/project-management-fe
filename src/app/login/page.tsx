"use client";
import React, { useState } from "react"; // Added React and useState import
import { useRouter } from "next/navigation"; // Ensure useRouter is imported
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa"; // Import missing icons
import apiClient from "@/app/utils/utils";
import { toast } from "react-toastify"; // Removed ToastContainer import
import axios from "axios"; // Import axios
import "react-toastify/dist/ReactToastify.css";

function LoginRegister() {
  const router = useRouter();
  const [username, setUser] = useState<string>("");
  const [password, setPass] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isRegister, setIsRegister] = useState<boolean>(false);

  const changeUsername = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUser(e.target.value);
  const changePassword = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPass(e.target.value);
  const changeEmail = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const changeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) =>
    setConfirmPassword(e.target.value);

  const toggleRememberMe = () => setRememberMe((prev) => !prev);
  const toggleIsRegister = () => setIsRegister((prev) => !prev);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isRegister) {
      if (password !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }
      try {
        await apiClient.post("/api/user/register/", {
          username,
          email,
          password,
        });
        toast.success("Đăng ký thành công!");
        setIsRegister(false);
      } catch (error: unknown) {
        // Added error typing
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.data
        ) {
          for (const value of Object.values(error.response.data)) {
            (value as string[]).forEach((element: string) => {
              toast.error(element);
            });
          }
        }
      }
    } else {
      try {
        const response = await apiClient.post("/api/user/token/", {
          username,
          password,
        });
        sessionStorage.setItem("access", response.data.access);
        if (rememberMe && response.data.refresh) {
          localStorage.setItem("refresh", response.data.refresh);
        } else {
          localStorage.removeItem("refresh");
        }
        toast.success("Đăng nhập thành công!");
        router.push("/");
      } catch {
        toast.error("Tên đăng nhập hoặc mật khẩu không chính xác");
      }
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded p-8">
          <h3 className="text-2xl font-bold text-center mb-6">
            {isRegister ? "Đăng Ký" : "Đăng Nhập"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  className="w-full px-3 py-2 border rounded pl-10"
                  value={username}
                  onChange={changeUsername}
                  onInput={changeUsername}
                  required
                />
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {isRegister && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border rounded pl-10"
                    value={email}
                    onChange={changeEmail}
                    onInput={changeEmail}
                    autoComplete="on"
                    required
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoComplete="on"
                  id="password"
                  className="w-full px-3 py-2 border rounded pl-10"
                  value={password}
                  onChange={changePassword}
                  onInput={changePassword}
                  minLength={8}
                  required
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {isRegister && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="confirmPassword"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full px-3 py-2 border rounded pl-10"
                    value={confirmPassword}
                    onChange={changeConfirmPassword}
                    onInput={changeConfirmPassword}
                    required
                  />
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  id="rememberMeCheckbox"
                  checked={rememberMe}
                  onChange={toggleRememberMe}
                />
                <label htmlFor="rememberMeCheckbox" className="text-gray-700">
                  Ghi nhớ
                </label>{" "}
                {/* Added label */}
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700"></p>
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={toggleIsRegister}
              >
                {isRegister ? "Đăng nhập" : "Đăng ký"}
              </button>
            </div>

            <button
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              type="submit"
            >
              {isRegister ? "Đăng Ký" : "Đăng Nhập"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default LoginRegister;
