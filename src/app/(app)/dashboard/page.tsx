
import Link from 'next/link';
import { PageHeader } from "@/components/shared/PageHeader";
import { KeyMetricCard } from "@/components/dashboard/KeyMetricsCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { KeepNotes } from "@/components/dashboard/KeepNotes";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FileText, Files, Grid, BarChart3, Users, ExternalLink, Edit2, Package, Settings, FileClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const recentlyModifiedData = [
  { id: "rm1", title: "Homepage Q3 Refresh", type: "Page", lastModified: "July 30, 2024", editor: "Alice W.", url: "/pages", icon: FileText },
  { id: "rm2", title: "New Product: Wireless Buds", type: "Product", lastModified: "July 29, 2024", editor: "Bob B.", url: "/content-files", icon: Package },
  { id: "rm3", title: "Summer Sale Banner", type: "Block", lastModified: "July 29, 2024", editor: "Alice W.", url: "/content-blocks", icon: Grid },
  { id: "rm4", title: "About Us - Team Section", type: "Page", lastModified: "July 28, 2024", editor: "Charlie B.", url: "/pages", icon: FileText },
  { id: "rm5", title: "Site Configuration Update", type: "Settings", lastModified: "July 27, 2024", editor: "Admin", url: "/settings", icon: Settings },
];


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your Apollo CMS activity." />

      <QuickActions /> 

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
        
        <div className="space-y-6 lg:col-span-1">
            <KeepNotes />
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileClock className="h-5 w-5" />
                        Recently Modified Content
                    </CardTitle>
                    <CardDescription>Quick access to recently updated items in the CMS.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {recentlyModifiedData.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                <div className="flex items-center gap-3">
                                <ItemIcon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <Link href={item.url} className="font-medium text-sm hover:underline">{item.title}</Link>
                                    <div className="text-xs text-muted-foreground"> {/* Changed <p> to <div> */}
                                      <Badge variant="outline" className="mr-1.5 text-xs">{item.type}</Badge>
                                      Modified by {item.editor} &bull; {item.lastModified}
                                    </div>
                                </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="text-xs shrink-0">
                                <Link href={item.url}><Edit2 className="mr-1 h-3 w-3" /> Edit</Link>
                                </Button>
                            </div>
                          );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <RecentActivityFeed />
    </div>
  );
}
