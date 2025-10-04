import { Badge } from "@/shared/components/ui/badge";
import { SmartImage } from "@/shared/components/ui/smart-image";
import { H1, Lead } from "@/shared/components/ui/typography";
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
  const highlights = model.features.slice(0, 2);

  if (isBackground) {
    return (
      <div
        className={cn(
          "relative hidden h-full w-full overflow-hidden bg-gradient-to-br from-primary/75 via-violet-700 to-indigo-800 opacity-95",
          "pointer-events-none lg:flex",
          className
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)]" />
        {model.accentShapes.map((shape, index) => (
          <div
            key={`${shape.position}-${index}`}
            className={`pointer-events-none absolute rounded-full bg-white/12 blur-3xl mix-blend-screen ${ACCENT_POSITION_CLASS[shape.position]}`}
            style={{
              width: shape.size,
              height: shape.size,
              animationDelay: `${index * 150}ms`
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden text-white bg-gradient-to-br from-primary/80 via-violet-700 to-indigo-800",
        variant === "panel" && "hidden xl:flex flex-1",
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
          "relative z-10 flex h-full w-full items-center justify-center px-8 py-12",
          isBackground ? "px-10 py-10 lg:px-16" : "px-12 py-16"
        )}
      >
        <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 text-sm font-medium text-white/80">
              <Badge variant="secondary" className="border-white/30 bg-white/15 text-white backdrop-blur-sm">
                {model.eyebrow}
              </Badge>
              <span className="text-xs uppercase tracking-[0.35em] text-white/70">{model.brand.tagline}</span>
            </div>

            <div className="flex items-center gap-3">
              <SmartImage
                src={model.brand.logoSrc}
                alt={model.brand.logoAlt}
                className="h-12 w-12 rounded-xl bg-white/10 p-3 shadow-inner shadow-white/10"
                imageClassName="object-contain"
                loading="lazy"
              />
              <div>
                <span className="text-xs font-semibold text-white/70">{model.brand.name}</span>
                <H1 className="mt-1 text-[2.1rem] font-semibold leading-tight tracking-tight text-white">
                  {model.headline}
                </H1>
              </div>
            </div>

            <Lead className="max-w-2xl text-base leading-relaxed text-white/85">{model.subheadline}</Lead>

            {highlights.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {highlights.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{feature.title}</p>
                        <p className="text-xs leading-5 text-white/75">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative hidden h-full items-center justify-center lg:flex">
            <div className="absolute inset-0 -m-8 rounded-full bg-primary/30 opacity-60 blur-3xl" />
            <div className="relative w-full max-w-sm rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
              {model.illustration.badge && (
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  {model.illustration.badge}
                </span>
              )}

              <SmartImage
                src={model.illustration.src}
                alt={model.illustration.alt}
                className="block w-full aspect-[4/5]"
                imageClassName="rounded-2xl object-cover"
                rounded="rounded-2xl"
                loading="lazy"
              />

              {model.illustration.caption && (
                <p className="mt-4 text-xs text-white/75">{model.illustration.caption}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthHero;
