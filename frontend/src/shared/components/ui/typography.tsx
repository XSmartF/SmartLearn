import * as React from "react";
import { cn } from "@/shared/lib/utils";

export const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h1 ref={ref} className={cn("scroll-m-20 text-3xl font-bold tracking-tight", className)} {...props} />
));
H1.displayName = "H1";

export const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("scroll-m-20 border-b pb-1 text-2xl font-semibold tracking-tight first:mt-0", className)} {...props} />
));
H2.displayName = "H2";

export const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)} {...props} />
));
H3.displayName = "H3";

export const H4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h4 ref={ref} className={cn("scroll-m-20 text-base font-semibold tracking-tight", className)} {...props} />
));
H4.displayName = "H4";

export const P = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("leading-7 [&:not(:first-child)]:mt-4", className)} {...props} />
));
P.displayName = "P";

export const Muted = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
Muted.displayName = "Muted";

export const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xl text-muted-foreground", className)} {...props} />
));
Lead.displayName = "Lead";

export const Small = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <small ref={ref as React.Ref<HTMLElement>} className={cn("text-sm font-medium leading-none", className)} {...props} />
));
Small.displayName = "Small";

export const MutedSmall = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <small ref={ref as React.Ref<HTMLElement>} className={cn("text-xs text-muted-foreground", className)} {...props} />
));
MutedSmall.displayName = "MutedSmall";
