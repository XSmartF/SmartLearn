import { Card, CardContent } from "@/shared/components/ui/card"
import { BookOpen, Users, Star } from "lucide-react"

interface LibraryOverviewStatsProps {
  ownedCount: number
  sharedCount: number
  favoriteCount: number
}

export default function LibraryOverviewStats({ ownedCount, sharedCount, favoriteCount }: LibraryOverviewStatsProps) {
  const stats = [
    {
      title: 'Thư viện của tôi',
      value: ownedCount,
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Được chia sẻ',
      value: sharedCount,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Yêu thích',
      value: favoriteCount,
      icon: Star,
      color: 'text-yellow-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
