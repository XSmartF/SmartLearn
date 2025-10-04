import { Badge } from "@/shared/components/ui/badge";
import { SmartImage } from "@/shared/components/ui/smart-image";
import { H1, Lead, P } from "@/shared/components/ui/typography";
import { cn } from "@/shared/lib/utils";
import type { AuthHeroModel } from "@/features/auth/types";

interface AuthHeroProps {
  model: AuthHeroModel;
  variant?: "panel" | "background";
  className?: string;
}

const ACCENT_POSITION_CLASS: Record<AuthHeroModel["accentShapes"][number]["position"], string> = {
  "top-left": "-top-20 -left-16",
  "top-right": "-top-24 right-0",
  "bottom-left": "bottom-0 -left-24",
  "bottom-right": "-bottom-24 -right-20"
};

export function AuthHero({ model, variant = "panel", className }: AuthHeroProps) {
  const isBackground = variant === "background";

  return (
    <div
      className={cn(
        "relative overflow-hidden text-white bg-gradient-to-br from-primary/80 via-violet-700 to-indigo-800",
        variant === "panel" && "hidden xl:flex flex-1",
        isBackground && "hidden lg:flex h-full w-full items-stretch justify-start opacity-95 pointer-events-none",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      {model.accentShapes.map((shape, index) => (
        <div
          key={`${shape.position}-${index}`}
          className={`pointer-events-none absolute rounded-full bg-white/10 blur-3xl mix-blend-screen ${ACCENT_POSITION_CLASS[shape.position]}`}
          style={{
            width: shape.size,
            height: shape.size,
            animationDelay: `${index * 150}ms`
          }}
        />
      ))}

      <div
        className={cn(
          "relative z-10 w-full max-w-5xl px-12 py-16 mx-auto",
          isBackground && "mx-0 max-w-6xl px-10 lg:px-20"
        )}
      >
        <div className={cn("grid gap-12 xl:grid-cols-[1.1fr_0.9fr] items-center", isBackground && "opacity-90")}> 
          <div className="space-y-8 text-left">
            <div className="flex items-center gap-3 text-sm font-medium text-white/80">
              <Badge variant="secondary" className="bg-white/15 text-white border-white/30 backdrop-blur-sm">
                {model.eyebrow}
              </Badge>
              <span className="uppercase tracking-[0.4em] text-xs text-white/70">{model.brand.tagline}</span>
            </div>

            <div className="flex items-center gap-3">
              <SmartImage
                src={model.brand.logoSrc}
                alt={model.brand.logoAlt}
                className="w-14 h-14 rounded-xl bg-white/10 p-3 shadow-inner shadow-white/10"
                imageClassName="object-contain"
                loading="lazy"
              />
              <div>
                <span className="text-sm font-semibold text-white/70">{model.brand.name}</span>
                <H1 className="mt-2 text-4xl leading-tight font-semibold tracking-tight text-white">
                  {model.headline}
                </H1>
              </div>
            </div>

            <div className="space-y-4">
              <Lead className="text-white/85 text-lg leading-relaxed">{model.subheadline}</Lead>
              <P className="text-white/70 text-sm leading-6 max-w-xl">{model.description}</P>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {model.features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10"
                  >
                    <div className="absolute inset-x-0 -top-12 h-24 translate-y-12 bg-gradient-to-b from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="relative z-10 mt-4 text-base font-semibold text-white">{feature.title}</h3>
                    <p className="relative z-10 mt-2 text-sm text-white/75 leading-6">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -m-10 rounded-full bg-primary/30 blur-3xl opacity-70" />
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-[30px] shadow-2xl">
              <div className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-lg">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                {model.illustration.badge}
              </div>

              <SmartImage
                src={model.illustration.src}
                alt={model.illustration.alt}
                className="block w-full aspect-[4/5]"
                imageClassName="rounded-2xl object-cover"
                rounded="rounded-2xl"
                loading="lazy"
              />

              {model.illustration.caption && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-left">
                  <p className="text-sm font-medium text-white/90">{model.illustration.caption}</p>
                  <p className="mt-1 text-xs text-white/70">{model.brand.tagline}</p>
                </div>
              )}

              <div className="pointer-events-none absolute -bottom-10 right-6 flex w-48 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/80 text-primary-foreground">
                  <span className="text-lg font-semibold">90%</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Học viên quay lại</p>
                  <p className="text-[11px] text-white/60">Nhờ nhắc nhở cá nhân hóa mỗi ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {model.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-left shadow-lg">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthHero;
