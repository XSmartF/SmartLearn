import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Brain, TrendingUp, Clock } from "lucide-react";
import { useAllLibraries } from "@/shared/hooks/useLibraries";
import { useMemo } from "react";

interface RecentActivity {
  id: string;
  type: 'study' | 'progress' | 'mastery';
  title: string;
  description: string;
  timestamp: string;
  libraryId: string;
  libraryTitle: string;
}

export function RecentActivities() {
  const { libraries, loading: libsLoading } = useAllLibraries();

  // For now, create mock recent activities
  const recentActivities: RecentActivity[] = useMemo(() => {
    const activities: RecentActivity[] = [];

    libraries.slice(0, 5).forEach((lib, index) => {
      activities.push({
        id: `activity-${index}`,
        type: 'study',
        title: `Học ${lib.title}`,
        description: `Hoàn thành phiên học`,
        timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
        libraryId: lib.id,
        libraryTitle: lib.title
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [libraries]);

  if (libsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Đang tải...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>5 hoạt động gần nhất</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {recentActivities.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm sm:text-base">Chưa có hoạt động nào</p>
          </div>
        ) : (
          recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border">
              <div className="flex-shrink-0 mt-0.5">
                {activity.type === 'study' && <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
                {activity.type === 'progress' && <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
                {activity.type === 'mastery' && <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{activity.title}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.timestamp).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
