
"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from 'lucide-react'; // Lucide icon for the card title
import type { PageStatus } from '@/app/(app)/pages/page';

interface PageStatusDataPoint {
  name: PageStatus | string; // Allow string for flexibility if statuses change
  value: number;
  fill: string;
}

interface PageStatusPieChartProps {
  data: PageStatusDataPoint[];
}

export function PageStatusPieChart({ data }: PageStatusPieChartProps) {
  const totalPages = data.reduce((sum, entry) => sum + entry.value, 0);

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" /> Page Status Distribution
          </CardTitle>
          <CardDescription>Overview of page statuses in the CMS.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
          <p className="text-muted-foreground">No page status data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" /> Page Status Distribution
        </CardTitle>
        <CardDescription>Current breakdown of page statuses ({totalPages} total pages).</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                    {`${name} (${value})`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)"}}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
