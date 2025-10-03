import { SmartImage } from "@/shared/components/ui/smart-image";
import { H3, MutedSmall } from "@/shared/components/ui/typography";
import type { DashboardHeroModel } from "@/features/dashboard/types";

interface DashboardHeroProps {
  model: DashboardHeroModel;
}

export function DashboardHero({ model }: DashboardHeroProps) {
  return (
    <section className="relative rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4">
      <div className="relative z-10 max-w-2xl space-y-1">
        <H3 className="text-xl font-bold sm:text-2xl">{model.title}</H3>
        <MutedSmall className="text-xs text-muted-foreground sm:text-sm">
          {model.subtitle}
        </MutedSmall>
      </div>
      <div className="pointer-events-none absolute right-2 -bottom-4 h-32 w-32 opacity-30 sm:right-4 sm:-bottom-6 sm:h-48 sm:w-48">
        <SmartImage
          src={model.accentImage.src}
          alt={model.accentImage.alt}
          className="h-full w-full"
          imageClassName="object-contain drop-shadow-xl"
          loading="lazy"
        />
      </div>
    </section>
  );
}
