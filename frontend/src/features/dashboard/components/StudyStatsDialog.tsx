import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { BarChart3, TrendingUp, Calendar, Target, BookOpen, Clock } from "lucide-react";
import { Loader } from '@/shared/components/ui/loader';
import { loadProgressSummary, type ProgressSummaryLite } from '@/shared/lib/firebase';
import { useUserLibraries } from '@/shared/hooks/useLibraries';

interface StudyStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StudyStats {
  totalLibraries: number;
  totalCards: number;
  totalMastered: number;
  totalSessions: number;
  averageAccuracy: number;
  recentActivity: Array<{
    date: string;
    sessions: number;
    cardsStudied: number;
  }>;
  libraryProgress: Array<{
    libraryId: string;
    title: string;
    progress: number;
    accuracy: number;
  }>;
}

export function StudyStatsDialog({ open, onOpenChange }: StudyStatsDialogProps) {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { libraries } = useUserLibraries();

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      // Load progress summaries for all libraries
      const summaries: Record<string, ProgressSummaryLite> = {};
      for (const lib of libraries) {
        try {
          const summary = await loadProgressSummary(lib.id);
          if (summary) summaries[lib.id] = summary;
        } catch (error) {
          console.warn(`Failed to load progress for library ${lib.id}:`, error);
        }
      }

      // Calculate stats
      const totalCards = Object.values(summaries).reduce((acc, s) => acc + s.total, 0);
      const totalMastered = Object.values(summaries).reduce((acc, s) => acc + s.mastered, 0);
      const totalSessions = Object.values(summaries).reduce((acc, s) => acc + (s.sessionCount || 0), 0);
      const accuracySamples = Object.values(summaries).map(s => s.accuracyOverall || 0).filter(x => x > 0);
      const averageAccuracy = accuracySamples.length ? accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length : 0;

      // Library progress
      const libraryProgress = libraries.map(lib => {
        const summary = summaries[lib.id];
        return {
          libraryId: lib.id,
          title: lib.title,
          progress: summary ? (summary.total > 0 ? (summary.mastered / summary.total) * 100 : 0) : 0,
          accuracy: summary?.accuracyOverall || 0
        };
      }).sort((a, b) => b.progress - a.progress);

      // Mock recent activity data (in real app, this would come from analytics)
      const recentActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          sessions: Math.floor(Math.random() * 5) + 1,
          cardsStudied: Math.floor(Math.random() * 20) + 5
        };
      });

      setStats({
        totalLibraries: libraries.length,
        totalCards,
        totalMastered,
        totalSessions,
        averageAccuracy,
        recentActivity,
        libraryProgress
      });
    } catch (error) {
      console.error('Failed to load study stats:', error);
    } finally {
      setLoading(false);
    }
  }, [libraries]);

  useEffect(() => {
    if (open && libraries.length > 0) {
      loadStats();
    }
  }, [open, libraries, loadStats]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Thống kê học tập
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="md" label="Đang tải thống kê" />
          </div>
        ) : stats ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="libraries">Thư viện</TabsTrigger>
              <TabsTrigger value="activity">Hoạt động</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{stats.totalLibraries}</div>
                    <div className="text-xs text-muted-foreground">Thư viện</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{stats.totalCards}</div>
                    <div className="text-xs text-muted-foreground">Tổng thẻ</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{stats.totalMastered}</div>
                    <div className="text-xs text-muted-foreground">Đã học thuộc</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    <div className="text-xs text-muted-foreground">Phiên học</div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tiến độ tổng thể</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Độ chính xác trung bình</span>
                      <span>{stats.averageAccuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.averageAccuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tiến độ học tập</span>
                      <span>{stats.totalCards > 0 ? ((stats.totalMastered / stats.totalCards) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <Progress value={stats.totalCards > 0 ? (stats.totalMastered / stats.totalCards) * 100 : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="libraries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tiến độ theo thư viện</CardTitle>
                  <CardDescription>
                    Xem tiến độ học tập của từng thư viện
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.libraryProgress.map((lib) => (
                      <div key={lib.libraryId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{lib.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {lib.progress.toFixed(1)}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {lib.accuracy.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={lib.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
                  <CardDescription>
                    Thống kê hoạt động học tập trong 7 ngày qua
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {new Date(day.date).toLocaleDateString('vi-VN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {day.sessions} phiên
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {day.cardsStudied} thẻ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}