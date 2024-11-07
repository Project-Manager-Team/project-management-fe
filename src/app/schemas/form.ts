import { z } from "zod";

export const inviteFormSchema = z.object({
  username: z.string().min(1, "Tên người dùng là bắt buộc"),
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  content: z.string().min(1, "Nội dung là bắt buộc")
});

export const loginSchema = z.object({
  mode: z.literal("login"),
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  rememberMe: z.boolean().default(false),

});

export const registerSchema = z.object({
  mode: z.literal("register"),
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(8, "Xác nhận mật khẩu là bắt buộc"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

export const loginFormSchema = z.union([
  loginSchema,
  registerSchema
]);

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
export type LoginFormInputs = z.infer<typeof loginFormSchema>;
export type ChangePasswordInputs = z.infer<typeof changePasswordSchema>;
export type RegisterFormInputs = z.infer<typeof registerSchema>;
