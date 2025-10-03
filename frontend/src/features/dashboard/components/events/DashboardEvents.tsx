import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { DashboardEventItemModel, DashboardEventSectionModel } from "@/features/dashboard/types";
import { format } from "date-fns";

interface DashboardEventsProps {
  model: DashboardEventSectionModel;
  manageHref?: string;
}

export function DashboardEvents({ model, manageHref }: DashboardEventsProps) {
  return (
    <section className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <CardTitle>{model.title}</CardTitle>
          <CardDescription>{model.description}</CardDescription>
        </div>
        {manageHref ? (
          <Button variant="ghost" size="sm" asChild>
            <Link to={manageHref}>Manage</Link>
          </Button>
        ) : null}
      </header>
      {model.items.length ? (
        <div className="grid gap-4">
          {model.items.map((item) => (
            <DashboardEventItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed text-center">
          <CardHeader className="gap-3">
            <CardTitle className="text-base font-semibold">
              {model.emptyState.title}
            </CardTitle>
            <CardDescription>{model.emptyState.description}</CardDescription>
          </CardHeader>
        </Card>
      )}
    </section>
  );
}

interface DashboardEventItemProps {
  item: DashboardEventItemModel;
}

function DashboardEventItem({ item }: DashboardEventItemProps) {
  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <CardContent className="p-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold leading-tight">
            {item.title}
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
            <time dateTime={item.scheduledAt.toISOString()} className="font-medium text-foreground">
              {format(item.scheduledAt, "PPpp")}
            </time>
            <span aria-hidden="true">•</span>
            <span>{item.relativeTime}</span>
            {item.location ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{item.location}</span>
              </>
            ) : null}
          </CardDescription>
        </div>
      </CardContent>
      <CardContent className="flex items-center gap-3 p-0">
        {item.type ? <Badge variant="secondary">{item.type}</Badge> : null}
      </CardContent>
    </Card>
  );
}
