import { BookOpen, Users, Star, Target } from "lucide-react"
import { StatCard } from "@/shared/components/StatCard"

interface LibraryOverviewStatsProps {
  ownedCount: number
  sharedCount: number
  favoriteCount: number
  totalCards: number
}

export default function LibraryOverviewStats({ ownedCount, sharedCount, favoriteCount, totalCards }: LibraryOverviewStatsProps) {
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
    },
    {
      title: 'Tổng số thẻ',
      value: totalCards,
      icon: Target,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          label={stat.title}
          value={stat.value}
          icon={<stat.icon className={`h-5 w-5 ${stat.color}`} />}
        />
      ))}
    </div>
  )
}
