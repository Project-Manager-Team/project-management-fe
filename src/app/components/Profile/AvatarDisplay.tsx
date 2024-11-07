import Image from "next/image";
import { RxAvatar } from "react-icons/rx";
import { DOMAIN } from "@/app/config/api";
import { AvatarDisplayProps } from "@/app/types/profile";

export function AvatarDisplay({
  avatar,
  size = 36,
  onClick,
}: AvatarDisplayProps) {
  if (!avatar) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        <RxAvatar className="text-3xl text-gray-700 hover:text-blue-600" />
      </div>
    );
  }

  const avatarUrl = avatar.startsWith("http") ? avatar : `${DOMAIN}${avatar}`;

  return (
    <div className="cursor-pointer">
      <Image
        src={avatarUrl}
        alt="Avatar"
        width={size}
        height={size}
        className="rounded-full"
        priority
        onClick={onClick}
      />
    </div>
  );
}
