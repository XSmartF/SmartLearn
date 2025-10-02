import type { ComponentProps, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface PageSectionProps extends Omit<ComponentProps<typeof Card>, "children"> {
  heading?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function PageSection({
  heading,
  description,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
  ...cardProps
}: PageSectionProps) {
  const hasHeader = !!heading || !!description || !!actions;

  return (
  <Card {...cardProps} className={cn("border-border/40", className)}>
      {hasHeader && (
        <CardHeader className={cn("flex flex-col gap-4 border-b border-border/30 bg-card/50 py-5 sm:flex-row sm:items-center sm:justify-between", headerClassName)}>
          <div className="space-y-1.5">
            {heading && (
              <CardTitle className="text-xl font-semibold leading-tight">
                {heading}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {actions && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {actions}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("space-y-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
