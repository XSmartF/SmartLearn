import type { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';
import type { LibraryTabId, LibraryTabOption } from '../../types';

interface LibraryTabsProps {
  activeTab: LibraryTabId;
  tabOptions: LibraryTabOption[];
  counts: Record<LibraryTabId, number>;
  onTabChange: (tab: LibraryTabId) => void;
  children: ReactNode;
}

export function LibraryTabs({ activeTab, tabOptions, counts, onTabChange, children }: LibraryTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as LibraryTabId)} className="space-y-6">
      <TabsList className="flex w-full overflow-x-auto rounded-full border border-border/30 bg-card/80 p-1 gap-2">
        {tabOptions.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              'flex-1 min-w-[140px] rounded-full text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
            )}
          >
            {tab.label} ({counts[tab.id] ?? 0})
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
