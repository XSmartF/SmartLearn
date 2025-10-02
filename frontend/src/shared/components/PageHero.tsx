import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Button, type ButtonProps } from "@/shared/components/ui/button";
import { SmartImage } from "@/shared/components/ui/smart-image";

interface PageHeroProps {
  heading: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  highlight?: ReactNode;
  mediaLeftSrc?: string;
  mediaRightSrc?: string;
  className?: string;
}

export function PageHero({
  heading,
  description,
  eyebrow,
  actions,
  highlight,
  mediaLeftSrc,
  mediaRightSrc,
  className,
}: PageHeroProps) {
  const hasLeftMedia = Boolean(mediaLeftSrc)
  const hasRightMedia = Boolean(mediaRightSrc)
  const hasBothMedia = hasLeftMedia && hasRightMedia
  const singleMediaSrc = !hasBothMedia ? mediaRightSrc ?? mediaLeftSrc : null

  return (
    <section
      className={cn(
        "relative overflow-visible rounded-3xl border border-border/30 bg-transparent p-6 shadow-none sm:p-10",
        className
      )}
    >
      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center">
        <div className="space-y-5 text-left">
          {eyebrow && <div className="text-sm font-semibold uppercase tracking-wide text-primary/80">{eyebrow}</div>}
          <div className="space-y-3">
            <div className="text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground">
              {heading}
            </div>
            {description && <p className="text-base text-muted-foreground sm:text-lg">{description}</p>}
          </div>
          {highlight && <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary/90 shadow-sm">{highlight}</div>}
          {actions && <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div>}
        </div>
        {(mediaLeftSrc || mediaRightSrc) && (
          <div className="relative flex items-center justify-center lg:justify-end">
            {singleMediaSrc ? (
              <SmartImage
                src={singleMediaSrc}
                alt="Page hero visual"
                className="max-h-[340px] w-full max-w-[520px]"
                rounded="rounded-2xl"
                imageClassName="object-contain drop-shadow-[0_24px_40px_rgba(17,24,39,0.12)]"
                loading="lazy"
              />
            ) : (
              <div className="relative flex h-64 w-full max-w-[480px] items-center justify-between">
                {mediaLeftSrc && (
                  <SmartImage
                    src={mediaLeftSrc}
                    alt="Illustration left"
                    className="h-40 w-40 sm:h-48 sm:w-48"
                    rounded="rounded-2xl"
                    imageClassName="object-contain drop-shadow-[0_18px_28px_rgba(15,23,42,0.14)]"
                    loading="lazy"
                  />
                )}
                {mediaRightSrc && (
                  <SmartImage
                    src={mediaRightSrc}
                    alt="Illustration right"
                    className="h-44 w-44 sm:h-56 sm:w-56"
                    rounded="rounded-2xl"
                    imageClassName="object-contain drop-shadow-[0_18px_28px_rgba(15,23,42,0.14)]"
                    loading="lazy"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function PageHeroPrimaryAction({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      size="lg"
      className={cn("shadow-[var(--neu-shadow)]", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function PageHeroSecondaryAction({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      className={cn("backdrop-blur", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
