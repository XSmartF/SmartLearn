import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { SmartImage } from "@/shared/components/ui/smart-image";

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  size?: number | string;
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, alt, className, fallback, size = 32, onError, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    const sizeStyle = typeof size === "number" ? { width: size, height: size } : undefined;
    const sizeClasses = typeof size === "string" ? size : undefined;

    return error ? (
      fallback ? (
        <span
          className={cn("inline-flex items-center justify-center rounded-full bg-muted", sizeClasses)}
          style={sizeStyle}
        >
          {fallback}
        </span>
      ) : (
        <span
          className={cn("inline-flex items-center justify-center rounded-full bg-muted", sizeClasses)}
          style={sizeStyle}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#e5e7eb"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#9ca3af">?</text></svg>
        </span>
      )
    ) : (
      <SmartImage
        ref={ref}
        src={src}
        alt={alt}
        className={cn("inline-block rounded-full", sizeClasses)}
        imageClassName={cn("rounded-full object-cover", className)}
        style={sizeStyle}
        onError={(event) => {
          setError(true);
          onError?.(event);
        }}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";
