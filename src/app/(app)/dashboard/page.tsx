import { PageHeader } from "@/components/shared/PageHeader";
import { KeyMetricCard } from "@/components/dashboard/KeyMetricsCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { KeepNotes } from "@/components/dashboard/KeepNotes";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { FileText, Files, Grid, BarChart3, Users, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const gaData = {
  mostVisited: [
    { page: "/home", visits: 1200 },
    { page: "/about", visits: 950 },
    { page: "/products", visits: 780 },
  ],
  bounceRate: 45.6,
};

const contentCreationData = [
  { date: "2024-07-01", pages: 5, blocks: 12, files: 3 },
  { date: "2024-07-08", pages: 3, blocks: 8, files: 5 },
  { date: "2024-07-15", pages: 7, blocks: 15, files: 2 },
  { date: "2024-07-22", pages: 4, blocks: 10, files: 6 },
];

const userEngagementData = [
  { date: "2024-07-01", activeUsers: 150, comments: 20 },
  { date: "2024-07-08", activeUsers: 180, comments: 25 },
  { date: "2024-07-15", activeUsers: 165, comments: 18 },
  { date: "2024-07-22", activeUsers: 200, comments: 30 },
];


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your Apollo CMS activity." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KeyMetricCard title="Total Pages" value="125" icon={FileText} description="+5 this month" />
        <KeyMetricCard title="Total Files" value="768" icon={Files} description="+50 this month" />
        <KeyMetricCard title="Content Blocks" value="2,345" icon={Grid} description="Across all pages" />
        <KeyMetricCard title="Active Users" value="42" icon={Users} description="Online now" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsChart 
          title="Content Creation Trends" 
          description="Pages, blocks, and files created per week."
          data={contentCreationData}
          dataKeyX="date"
          dataKeysY={[
            { key: "pages", name: "Pages", color: "hsl(var(--chart-1))" },
            { key: "blocks", name: "Blocks", color: "hsl(var(--chart-2))" },
            { key: "files", name: "Files", color: "hsl(var(--chart-3))" },
          ]}
        />
        <AnalyticsChart 
          title="User Engagement" 
          description="Active users and comments per week."
          data={userEngagementData}
          dataKeyX="date"
          dataKeysY={[
            { key: "activeUsers", name: "Active Users", color: "hsl(var(--chart-4))" },
            { key: "comments", name: "Comments", color: "hsl(var(--chart-5))" },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
             <BarChart3 className="h-5 w-5" /> Google Analytics Overview
            </CardTitle>
            <CardDescription>Live insights from your Google Analytics property.
              <Button variant="link" size="sm" asChild className="ml-2 p-0 h-auto">
                <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" >
                  Open GA <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              {/* Placeholder for Google Analytics iframe */}
              <p className="text-muted-foreground">Google Analytics iframe will be embedded here.</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Most Visited Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1 text-sm">
                            {gaData.mostVisited.map(p => <li key={p.page}>{p.page} ({p.visits} visits)</li>)}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Bounce Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{gaData.bounceRate}%</p>
                    </CardContent>
                </Card>
            </div>
          </CardContent>
        </Card>
        <KeepNotes />
      </div>

      <RecentActivityFeed />
    </div>
  );
}
