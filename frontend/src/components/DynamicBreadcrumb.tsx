import { Link, useMatches } from 'react-router-dom'
import type { UIMatch } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis
} from '@/components/ui/breadcrumb'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

// Component tạo breadcrumb động dựa theo handle.breadcrumb của từng route.
// handle.breadcrumb có thể là string hoặc hàm (match) => string | ReactNode
interface DynamicBreadcrumbProps {
  /** Số breadcrumb tối đa hiển thị (kể cả first + collapsed + tail) trước khi thu gọn */
  maxVisible?: number // tổng số mục link hiển thị (mặc định mẫu: 4 => first, ellipsis, second-last, last)
  /** Số mục cuối (tail) luôn hiển thị ngoài cùng */
  tailCount?: number
  /** Chiều rộng tối đa mỗi nhãn (css max-width) */
  maxLabelWidthClass?: string
}

export function DynamicBreadcrumb({
  maxVisible = 4,
  tailCount = 2,
  maxLabelWidthClass = 'max-w-[180px]'
}: DynamicBreadcrumbProps) {
  const matches = useMatches()

  // Lọc ra những matches có handle và breadcrumb
  type HandleType = { breadcrumb?: string | ((m: UIMatch) => React.ReactNode) }
  const crumbs = matches
    .filter((m): m is UIMatch<unknown, HandleType> => !!m.handle && !!(m.handle as HandleType).breadcrumb)
    .map((m, idx, arr) => {
      const bc = (m.handle as HandleType).breadcrumb!
      const isLast = idx === arr.length - 1
      const label = typeof bc === 'function' ? bc(m) : bc
      const to = m.pathname
      return { label, to, isLast }
    })

  if (crumbs.length === 0) return null

  // Nếu số crumbs nhỏ hơn hoặc bằng maxVisible thì hiển thị bình thường
  const needsCollapse = crumbs.length > maxVisible

  let displayCrumbs = crumbs
  let hiddenMiddle: typeof crumbs = []

  if (needsCollapse) {
    const first = crumbs[0]
    const tail = crumbs.slice(-tailCount) // luôn giữ tailCount cuối
    hiddenMiddle = crumbs.slice(1, crumbs.length - tailCount)
    displayCrumbs = [first, ...tail]
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displayCrumbs.map((c, idx) => {
          const isFirst = idx === 0
          const isLast = c.isLast
          const originalIndex = needsCollapse && idx > 0 ? crumbs.length - displayCrumbs.length + idx : idx

          // Chèn ellipsis ngay sau phần tử đầu tiên nếu cần thu gọn
          if (needsCollapse && isFirst) {
            return (
              <>
                <BreadcrumbItem key={`bc-first`}>
                  {c.isLast ? (
                    <BreadcrumbPage className={`truncate ${maxLabelWidthClass}`} title={String(c.label)}>
                      {c.label}
                    </BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink asChild>
                        <Link to={c.to} className={`truncate ${maxLabelWidthClass}`} title={String(c.label)}>
                          {c.label}
                        </Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
                {/* Ellipsis item */}
                <BreadcrumbItem key="bc-ellipsis">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 py-0 gap-1">
                        <BreadcrumbEllipsis />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-2 min-w-[180px] flex flex-col gap-1">
                      {hiddenMiddle.map((m, mi) => (
                        <Link
                          key={mi}
                          to={m.to}
                          className="text-sm hover:text-foreground truncate max-w-[220px]"
                          title={String(m.label)}
                        >
                          {m.label}
                        </Link>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
              </>
            )
          }

          return (
            <BreadcrumbItem key={`bc-${originalIndex}`}>
              {isLast ? (
                <BreadcrumbPage className={`truncate ${maxLabelWidthClass}`} title={String(c.label)}>
                  {c.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={c.to} className={`truncate ${maxLabelWidthClass}`} title={String(c.label)}>
                      {c.label}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default DynamicBreadcrumb
