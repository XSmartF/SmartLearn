import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Loader } from "@/shared/components/ui/loader";

export interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  rounded?: boolean | string; // true uses rounded-lg, string allows custom radius classes
  aspect?: string; // e.g. 'square', 'video', '16/9' etc (can be translated to classes externally)
  showLoader?: boolean;
}

// Lightweight image component with error + loading fallback (no external deps)
export const SmartImage = React.forwardRef<HTMLImageElement, SmartImageProps>(
  ({ className, fallback, rounded = false, showLoader = true, onLoad, onError, ...props }, ref) => {
    const [loaded, setLoaded] = React.useState(false);
    const [errored, setErrored] = React.useState(false);

    const radiusClass = typeof rounded === 'string' ? rounded : (rounded ? 'rounded-lg' : '');

    return (
      <span className={cn('relative inline-block overflow-hidden', radiusClass, className)}>
    {!errored && (
          <img
            ref={ref}
      {...props}
      onLoad={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { setLoaded(true); onLoad?.(e); }}
      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { setErrored(true); onError?.(e); }}
      className={cn('block w-full h-full object-cover', className?.replace(/rounded[^ ]+/g,''))}
          />
        )}
        {(!loaded && !errored && showLoader) && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader size="sm" />
          </span>
        )}
        {errored && (
          <span className="flex items-center justify-center text-[10px] text-muted-foreground w-full h-full bg-muted/40 select-none">
            {fallback || 'IMG'}
          </span>
        )}
      </span>
    );
  }
);
SmartImage.displayName = 'SmartImage';
