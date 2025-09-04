import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  size?: number | string;
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, alt, className, fallback, size = 32, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    return error ? (
      fallback ? (
        <span className={cn("inline-flex items-center justify-center rounded-full bg-muted", typeof size === "number" ? `w-[${size}px] h-[${size}px]` : size)}>{fallback}</span>
      ) : (
        <span className={cn("inline-flex items-center justify-center rounded-full bg-muted", typeof size === "number" ? `w-[${size}px] h-[${size}px]` : size)}>
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#e5e7eb"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#9ca3af">?</text></svg>
        </span>
      )
    ) : (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("rounded-full object-cover", className)}
        width={typeof size === "number" ? size : undefined}
        height={typeof size === "number" ? size : undefined}
        onError={()=>setError(true)}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";
