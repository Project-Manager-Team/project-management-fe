import { z } from "zod";

export const inviteFormSchema = z.object({
  username: z.string().min(1, "Tên người dùng là bắt buộc"),
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  content: z.string().min(1, "Nội dung là bắt buộc")
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Mật khẩu cũ là bắt buộc"),
  newPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  newPassword2: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự")
}).refine((data) => data.newPassword === data.newPassword2, {
  message: "Mật khẩu không khớp",
  path: ["newPassword2"]
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "Mật khẩu mới không được trùng với mật khẩu cũ",
  path: ["newPassword"]
});

export type InviteFormInputs = z.infer<typeof inviteFormSchema>;
export type ChangePasswordInputs = z.infer<typeof changePasswordSchema>;
