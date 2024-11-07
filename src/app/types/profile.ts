
export interface User {
  username: string;
  email: string;
  avatar?: string;
}

export interface ProfileState {
  showInfo: boolean;
  changePass: boolean;
  showLogin: boolean;
}

export interface ProfileDropdownProps {
  user: User;
  onChangePassword: () => void;
  onSignOut: () => void;
  onAvatarClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface LoginRegisterFormProps {
  isRegister: boolean;
  toggleRegisterMode: () => void;
  onSuccess: () => void;
}

export interface ChangePasswordFormProps {
  username: string;
  onBack: () => void;
}

export interface AvatarDisplayProps {
  avatar?: string;
  size?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement | HTMLImageElement>) => void;
}
