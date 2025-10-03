import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { MutedSmall } from "@/shared/components/ui/typography";
import type { DashboardFlashcardItemModel, DashboardFlashcardSectionModel } from "@/features/dashboard/types";

interface DashboardFlashcardsProps {
  model: DashboardFlashcardSectionModel;
}

export function DashboardFlashcards({ model }: DashboardFlashcardsProps) {
  if (model.isLoading) {
    return (
      <section className="grid gap-4">
        <header className="space-y-1">
          <CardTitle>{model.title}</CardTitle>
          <CardDescription>{model.description}</CardDescription>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse min-h-[220px]" />
          ))}
        </div>
      </section>
    );
  }

  if (!model.items.length) {
    return (
      <section className="grid gap-4">
        <header className="space-y-1">
          <CardTitle>{model.title}</CardTitle>
          <CardDescription>{model.description}</CardDescription>
        </header>
        <Card className="items-center justify-center text-center">
          <CardHeader className="gap-3">
            <CardTitle className="text-lg">{model.emptyState.title}</CardTitle>
            <CardDescription>{model.emptyState.description}</CardDescription>
            <Button asChild>
              <Link to={model.emptyState.actionHref}>{model.emptyState.actionLabel}</Link>
            </Button>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <header className="space-y-1">
        <CardTitle>{model.title}</CardTitle>
        <CardDescription>{model.description}</CardDescription>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {model.items.map((item) => (
          <DashboardFlashcardItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

interface DashboardFlashcardItemProps {
  item: DashboardFlashcardItemModel;
}

function DashboardFlashcardItem({ item }: DashboardFlashcardItemProps) {
  const masteredPercent = item.totalCards
    ? Math.round((item.masteredCards / item.totalCards) * 100)
    : 0;

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="gap-2">
        <CardTitle className="text-lg font-semibold">
          <Link to={item.continueHref} className="hover:underline">
            {item.title}
          </Link>
        </CardTitle>
        <CardDescription className="space-y-1">
          <MutedSmall>Total cards: {item.totalCards}</MutedSmall>
          <MutedSmall>Mastered: {item.masteredCards}</MutedSmall>
          {typeof item.accuracyPercent === "number" ? (
            <MutedSmall>Accuracy: {item.accuracyPercent}%</MutedSmall>
          ) : null}
          {typeof item.sessions === "number" ? (
            <MutedSmall>Sessions: {item.sessions}</MutedSmall>
          ) : null}
          {item.ownerName && !item.isOwned ? (
            <MutedSmall>Shared by {item.ownerName}</MutedSmall>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Progress</span>
            <span>{item.progressPercent}%</span>
          </div>
          <Progress value={item.progressPercent} className="mt-2 h-2" />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Mastery</span>
          <span>{masteredPercent}%</span>
        </div>
      </CardContent>
      <CardContent>
        <Button asChild className="w-full">
          <Link to={item.continueHref}>{item.isOwned ? "Continue" : "Review"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
