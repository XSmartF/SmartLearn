import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const Placeholder = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export function SetupSkeleton() {
  return (
    <div className="space-y-6">
      <Placeholder className="h-12 w-64" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map(index => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>
                <Placeholder className="h-6 w-44" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[0, 1, 2].map(item => (
                <Placeholder key={item} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 py-6">
          {[0, 1, 2].map(item => (
            <Placeholder key={item} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
