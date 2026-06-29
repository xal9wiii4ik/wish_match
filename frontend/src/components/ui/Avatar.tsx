import { cn } from "@/lib/cn";
import { get_initials } from "@/lib/format";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const size_styles: Record<AvatarSize, string> = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-accent-500 font-semibold text-white",
        size_styles[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{get_initials(name)}</span>
      )}
    </div>
  );
}
