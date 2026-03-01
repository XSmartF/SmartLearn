import { lazy, Suspense } from "react";
import { SmartImage } from "@/shared/components/ui/smart-image";
import { H3, MutedSmall } from "@/shared/components/ui/typography";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import type { DashboardHeroModel } from "@/features/dashboard/types";

const LazyDashboardScene = lazy(() =>
  import("@/shared/components/three/DashboardScene").then((mod) => ({ default: mod.DashboardScene }))
);

interface DashboardHeroProps {
  model: DashboardHeroModel;
}

export function DashboardHero({ model }: DashboardHeroProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const show3D = isDesktop && !prefersReducedMotion;

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4">
      <div className="relative z-10 max-w-2xl space-y-1">
        <H3 className="text-xl font-bold sm:text-2xl">{model.title}</H3>
        <MutedSmall className="text-xs text-muted-foreground sm:text-sm">
          {model.subtitle}
        </MutedSmall>
      </div>
      <div className="pointer-events-none absolute right-0 -bottom-2 h-36 w-36 sm:right-2 sm:-bottom-2 sm:h-52 sm:w-52">
        {show3D ? (
          <Suspense fallback={null}>
            <LazyDashboardScene className="h-full w-full" />
          </Suspense>
        ) : (
          <SmartImage
            src={model.accentImage.src}
            alt={model.accentImage.alt}
            className="h-full w-full opacity-30"
            imageClassName="object-contain drop-shadow-xl"
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
}
