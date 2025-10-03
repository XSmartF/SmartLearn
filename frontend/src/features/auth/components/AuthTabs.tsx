import { type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { AuthTabConfig, AuthTabId } from "@/features/auth/types";

interface AuthTabsProps {
  tabs: AuthTabConfig[];
  activeTab: AuthTabId;
  onTabChange: (tab: AuthTabId) => void;
  content: Record<AuthTabId, ReactNode>;
}

export function AuthTabs({ tabs, activeTab, onTabChange, content }: AuthTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as AuthTabId)} className="w-full space-y-8">
      <TabsList className="relative mx-auto flex w-full max-w-[360px] items-center justify-center gap-2 rounded-3xl border border-border/60 bg-background/70 p-1.5 shadow-[0_20px_45px_-30px_rgba(79,70,229,0.65)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-sky-400/25 opacity-40" />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="group relative flex-1 rounded-2xl px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 data-[state=active]:text-foreground data-[state=active]:shadow-[0_10px_30px_-12px_rgba(56,189,248,0.65)]"
            >
              <span className="absolute inset-0 rounded-2xl border border-transparent transition-all duration-300 data-[state=active]:border-primary/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-white/70 data-[state=active]:to-primary/10 data-[state=active]:backdrop-blur-lg" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-sky-400/20 text-primary transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:text-primary-foreground group-data-[state=active]:from-primary group-data-[state=active]:to-sky-500">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{tab.label}</span>
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-white/90 via-white/75 to-white/55 p-6 shadow-[0_25px_45px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -left-1/2 top-6 hidden h-32 w-32 rounded-full bg-primary/20 blur-3xl sm:block" />
          <div className="pointer-events-none absolute -right-12 bottom-10 hidden h-28 w-28 rounded-full bg-sky-400/30 blur-3xl sm:block" />

          {tab.description && (
            <p className="mb-6 text-center text-sm font-medium text-muted-foreground/90">
              {tab.description}
            </p>
          )}
          <div className="relative z-10">{content[tab.id]}</div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default AuthTabs;
