import { Card, CardContent } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"

interface StatItem {
  title: string
  value: string | number
  percentage: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface LibraryStatsProps {
  stats: StatItem[]
}

export default function LibraryStats({ stats }: LibraryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="mt-4">
              <Progress value={stat.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{stat.percentage}%</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
