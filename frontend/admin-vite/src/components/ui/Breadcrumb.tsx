import { Link, useLocation } from "react-router-dom"
import { Home, ChevronRight, MoreHorizontal } from "lucide-react"
import React from "react"
import { cn } from "../../lib/utils"

export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: React.ReactNode
  badge?: number | string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  homePath?: string
  showHome?: boolean
  maxItems?: number
  variant?: "default" | "pill" | "minimal"
  onItemClick?: (item: BreadcrumbItem) => void
}

export function Breadcrumb({
  items,
  className,
  homePath = "/dashboard",
  showHome = true,
  maxItems = 4,
  variant = "default",
  onItemClick
}: BreadcrumbProps) {

  const location = useLocation()

  /* ======================================================
     Limita itens (colapsa centro se necessário)
  ====================================================== */

  const getDisplayItems = (): BreadcrumbItem[] => {
    if (items.length <= maxItems) return items

    const first = items[0]
    const last = items[items.length - 1]
    const middle = items.slice(1, -1)

    return [
      first,
      { label: "...", icon: <MoreHorizontal size={14} /> },
      ...middle.slice(-1),
      last
    ]
  }

  const displayItems = getDisplayItems()

  /* ======================================================
     Estilos por variante
  ====================================================== */

  const baseItem =
    "flex items-center gap-1.5 transition-colors duration-200 rounded-lg"

  const linkStyles =
    variant === "pill"
      ? "px-3 py-1.5 bg-surface text-on-surface hover:bg-yellow-400/10 hover:text-yellow-400"
      : "text-on-surface/60 hover:text-yellow-400"

  const currentStyles =
    variant === "pill"
      ? "px-3 py-1.5 bg-yellow-400/10 text-yellow-400 font-medium"
      : "text-yellow-400 font-medium"

  /* ======================================================
     Render
  ====================================================== */

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center flex-wrap gap-1 text-sm",
        className
      )}
    >
      {/* HOME */}
      {showHome && (
        <>
          <Link
            to={homePath}
            className={cn(baseItem, linkStyles)}
          >
            <Home size={16} />
          </Link>

          {displayItems.length > 0 && (
            <ChevronRight
              size={14}
              className="text-on-surface/30"
            />
          )}
        </>
      )}

      {/* ITEMS */}
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1
        const isCurrent = index === displayItems.length - 1
        const isEllipsis = item.label === "..."

        return (
          <React.Fragment key={index}>
            {item.path && !isLast && !isEllipsis ? (
              <Link
                to={item.path}
                onClick={() => onItemClick?.(item)}
                className={cn(baseItem, linkStyles)}
              >
                {item.icon}
                <span>{item.label}</span>

                {item.badge && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-400/20 text-yellow-400 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ) : (
              <span
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  baseItem,
                  isEllipsis
                    ? "text-on-surface/30"
                    : isCurrent
                      ? currentStyles
                      : "text-on-surface/60"
                )}
              >
                {item.icon}
                <span>{item.label}</span>

                {item.badge && isCurrent && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-400 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </span>
            )}

            {!isLast && (
              <ChevronRight
                size={14}
                className="text-on-surface/30"
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}