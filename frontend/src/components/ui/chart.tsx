"use client"

import * as React from "react"
import * as Recharts from "recharts"
import type {
  DefaultTooltipContentProps,
  DefaultLegendContentProps,
} from "recharts"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within <ChartContainer />")
  return context
}

/* -------------------------------------------------------------------------- */
/*                              CHART CONTAINER                               */
/* -------------------------------------------------------------------------- */

const THEMES = { light: "", dark: ".dark" } as const

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ReactNode
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-layer]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <Recharts.ResponsiveContainer>{children}</Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

/* -------------------------------------------------------------------------- */
/*                                 STYLES                                     */
/* -------------------------------------------------------------------------- */

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const entries = Object.entries(config).filter(([, v]) => v.color || v.theme)
  if (!entries.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${entries
  .map(([key, cfg]) => {
    const color = cfg.theme?.[theme as keyof typeof cfg.theme] || cfg.color
    return color ? `--color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}`
          )
          .join("\n"),
      }}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                TOOLTIP                                     */
/* -------------------------------------------------------------------------- */

const ChartTooltip = Recharts.Tooltip

type TooltipItem = NonNullable<DefaultTooltipContentProps<any, any>["payload"]>[number]

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: TooltipItem[]
    label?: string | number
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    formatter?: DefaultTooltipContentProps<any, any>["formatter"]
    labelFormatter?: DefaultTooltipContentProps<any, any>["labelFormatter"]
    color?: string
  }
>((props, ref) => {
  const {
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    formatter,
    color,
    nameKey,
    labelKey,
  } = props

  const { config } = useChart()
  if (!active || !payload?.length) return null

  const renderLabel = () => {
    if (hideLabel) return null
    const item = payload[0]
    const key = `${labelKey || item.dataKey || item.name || "value"}`
    const itemConfig = getPayloadConfig(config, item, key)
    const value =
      typeof label === "string" ? config[label]?.label || label : itemConfig?.label
    if (!value) return null
    return <div className="font-medium">{labelFormatter ? labelFormatter(value, payload) : value}</div>
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {renderLabel()}
      {payload.map((item, index) => {
        const key = `${nameKey || item.name || item.dataKey || "value"}`
        const itemConfig = getPayloadConfig(config, item, key)
        const indicatorColor = color || (item.payload as any)?.fill || item.color

        return (
          <div key={index} className="flex items-center gap-2">
            {!hideIndicator && (
              <div
                className={cn(
                  "rounded-[2px]",
                  indicator === "dot" && "h-2.5 w-2.5",
                  indicator === "line" && "h-4 w-1",
                  indicator === "dashed" && "h-4 w-0 border border-dashed"
                )}
                style={{
                  backgroundColor: indicator === "dot" ? indicatorColor : undefined,
                  borderColor: indicatorColor,
                }}
              />
            )}
            <div className="flex flex-1 justify-between">
              <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
              {item.value != null && (
                <span className="font-mono tabular-nums">{Number(item.value).toLocaleString()}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

/* -------------------------------------------------------------------------- */
/*                                 LEGEND                                     */
/* -------------------------------------------------------------------------- */

const ChartLegend = Recharts.Legend
type LegendItem = NonNullable<DefaultLegendContentProps<any, any>["payload"]>[number]

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    payload?: LegendItem[]
    verticalAlign?: DefaultLegendContentProps<any, any>["verticalAlign"]
    hideIcon?: boolean
    nameKey?: string
  }
>(({ className, payload, verticalAlign = "bottom", hideIcon, nameKey }, ref) => {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfig(config, item, key)
        return (
          <div key={index} className="flex items-center gap-1.5">
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: item.color }} />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getPayloadConfig(config: ChartConfig, payload: TooltipItem, key: string) {
  const payloadData = payload.payload as Record<string, unknown> | undefined
  const labelKey = typeof payloadData?.[key] === "string" ? payloadData[key] : key
  return config[labelKey as string] || config[key]
}

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
