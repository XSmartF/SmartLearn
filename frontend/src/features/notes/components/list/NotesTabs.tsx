import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type { NoteTabId, NoteTabOption } from '../../types';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

interface NotesTabsProps {
  activeTab: NoteTabId;
  tabOptions: NoteTabOption[];
  counts: Record<NoteTabId, number>;
  onTabChange: (tab: NoteTabId) => void;
  children: ReactNode;
}

export function NotesTabs({ activeTab, tabOptions, counts, onTabChange, children }: NotesTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as NoteTabId)} className="space-y-4 sm:space-y-6">
      <TabsList className="flex w-full overflow-x-auto no-scrollbar whitespace-nowrap rounded-full border border-border/30 bg-card/70 p-1 gap-1 sm:gap-2 scroll-px-2 snap-x snap-mandatory touch-pan-x overscroll-x-contain">
        {tabOptions.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              'flex-none shrink-0 rounded-full text-sm font-medium px-3 sm:px-4 snap-start',
              'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
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
