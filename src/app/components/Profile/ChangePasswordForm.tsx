import { FaArrowAltCircleLeft } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import apiClient from "@/app/utils/apiClient";
import {
  changePasswordSchema,
  type ChangePasswordInputs,
} from "@/app/schemas/form";
import { ChangePasswordFormProps } from "@/app/types/profile";

export function ChangePasswordForm({
  username,
  onBack,
}: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInputs>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInputs) => {
    try {
      await apiClient.post("/api/user/change-password/", {
        old_password: data.oldPassword,
        new_password: data.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      reset();
      onBack();
    } catch {
      toast.error("Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-center mb-4">
        <FaArrowAltCircleLeft
          onClick={() => {
            onBack();
            reset();
          }}
          className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors text-xl mr-3"
        />
        <h3 className="text-lg font-semibold text-gray-800">Đổi Mật Khẩu</h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          name="username"
          value={username || ""}
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
  );
}
