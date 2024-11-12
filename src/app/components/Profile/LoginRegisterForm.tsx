import React, { useEffect } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import apiClient from "@/app/utils/apiClient";
import {
  loginFormSchema,
  type LoginFormInputs,
  type RegisterFormInputs,
} from "@/app/schemas/form";
import { LoginRegisterFormProps } from "@/app/types/profile";

export function LoginRegisterForm({
  isRegister,
  toggleRegisterMode,
  onSuccess,
}: LoginRegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    defaultValues: isRegister
      ? {
          mode: "register",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        }
      : {
          mode: "login",
          username: "",
          password: "",
          rememberMe: false,
        },
  });

  // Reset form whenever isRegister changes to ensure 'mode' is correctly set
  useEffect(() => {
    if (isRegister) {
      reset({
        mode: "register",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } else {
      reset({
        mode: "login",
        username: "",
        password: "",
        rememberMe: false,
      });
    }
  }, [isRegister, reset]);

  const onSubmit = async (data: LoginFormInputs) => {
    console.log("Form data:", data); // Debugging line
    if (data.mode === "register") {
      try {
        await apiClient.post("/api/user/register/", {
          username: data.username,
          email: data.email,
          password: data.password,
        });
        toast.success("Đăng ký thành công!");
        toggleRegisterMode();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
          Object.values(error.response.data).forEach((value) => {
            (value as string[]).forEach((element: string) => {
              toast.error(element);
            });
          });
        }
      }
    } else {
      try {
        const response = await apiClient.post("/api/user/token/", {
          username: data.username,
          password: data.password,
        });
        sessionStorage.setItem("access", response.data.access);
        if (data.rememberMe && response.data.refresh) {
          localStorage.setItem("refresh", response.data.refresh);
        }
        toast.success("Đăng nhập thành công!");
        onSuccess();
      } catch {
        toast.error("Tên đăng nhập hoặc mật khẩu không chính xác");
      }
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-center mb-4">
        {isRegister ? "Đăng Ký" : "Đăng Nhập"}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input
          type="hidden"
          {...register("mode")}
          value={isRegister ? "register" : "login"}
        />

        <div className="relative">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            className="w-full px-3 py-2 border rounded-lg pl-9 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
            {...register("username")}
          />
          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          {errors.username?.message && (
            <span className="text-xs text-red-500 mt-1">
              {errors.username.message.toString()}
            </span>
          )}
        </div>

        {isRegister && (
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border rounded-lg pl-9 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
              {...register("email", { required: isRegister })}
            />
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            {(errors as FieldErrors<RegisterFormInputs>).email?.message && (
              <span className="text-xs text-red-500 mt-1">
                {(errors as FieldErrors<RegisterFormInputs>).email?.message}
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full px-3 py-2 border rounded-lg pl-9 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
            {...register("password")}
          />
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          {errors.password?.message && (
            <span className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </span>
          )}
        </div>

        {isRegister && (
          <div className="relative">
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              className="w-full px-3 py-2 border rounded-lg pl-9 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
              {...register("confirmPassword")}
            />
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            {(errors as FieldErrors<RegisterFormInputs>).confirmPassword
              ?.message && (
              <span className="text-xs text-red-500 mt-1">
                {
                  (errors as FieldErrors<RegisterFormInputs>).confirmPassword
                    ?.message
                }
              </span>
            )}
          </div>
        )}

        {!isRegister && (
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="mr-2"
              {...register("rememberMe")}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm"
        >
          {isRegister ? "Đăng Ký" : "Đăng Nhập"}
        </button>

        <div className="text-center text-sm dark:text-gray-300">
          <button
            type="button"
            className="text-blue-500 hover:underline"
            onClick={() => {
              toggleRegisterMode();
              // The form will reset automatically via useEffect
            }}
          >
            {isRegister
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có tài khoản? Đăng ký"}
          </button>
        </div>
      </form>
    </div>
  );
}
