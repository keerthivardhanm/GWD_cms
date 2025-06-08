"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart" // Assuming ChartConfig is exported if needed

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface AnalyticsChartProps {
  title: string;
  description: string;
  data?: any[]; // Replace any with specific data type
  config?: ChartConfig;
  dataKeyX: string;
  dataKeysY: { key: string; name: string; color: string }[];
}


export function AnalyticsChart({
  title,
  description,
  data = chartData, // default placeholder data
  config = chartConfig, // default placeholder config
  dataKeyX = "month",
  dataKeysY = [
    { key: "desktop", name: "Desktop", color: config.desktop.color },
    { key: "mobile", name: "Mobile", color: config.mobile.color },
  ],
} : AnalyticsChartProps ) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={dataKeyX}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
             <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)"}}
            />
            {dataKeysY.map((item) => (
               <Bar key={item.key} dataKey={item.key} fill={item.color} radius={[4, 4, 0, 0]} name={item.name} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
