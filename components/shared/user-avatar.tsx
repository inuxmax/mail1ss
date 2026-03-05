import { User } from "@prisma/client";
import { AvatarProps } from "@radix-ui/react-avatar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "image" | "name" | "email">;
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  const userName = user.name?.trim() || "User";
  const userEmail = user.email?.trim() || "";
  const imageSrc = user.image?.trim();
  const fallbackSeed = encodeURIComponent(userName || userEmail || "user");
  const fallbackAvatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${fallbackSeed}&radius=50&backgroundType=gradientLinear`;
  const avatarSrc = imageSrc || fallbackAvatarUrl;
  const initials = userName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <Avatar {...props} className={`bg-muted ${props.className || ""}`}>
      <AvatarImage
        alt="Picture"
        src={avatarSrc}
        referrerPolicy="no-referrer"
      />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
        {initials || "U"}
      </AvatarFallback>
    </Avatar>
  );
}
