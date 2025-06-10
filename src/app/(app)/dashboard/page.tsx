
"use client";

import Link from 'next/link';
import { PageHeader } from "@/components/shared/PageHeader";
import { KeyMetricCard } from "@/components/dashboard/KeyMetricsCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { KeepNotes } from "@/components/dashboard/KeepNotes";
import type { RecentActivityItem } from "@/components/dashboard/RecentActivityFeed"; // Still used for type of recent content items
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FileText, Files, Grid, BarChart3, Users, ExternalLink, Edit2, Package, Settings, FileClock, Loader2, ListChecks, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp, getCountFromServer } from 'firebase/firestore';
import type { Page as PageData } from '@/app/(app)/pages/page';
import type { ContentBlock } from '@/app/(app)/content-blocks/page';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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

interface DashboardMetrics {
  totalPages: number;
  totalFiles: number;
  totalContentBlocks: number;
  totalUsers: number;
}

interface AuditLogEntry {
  id: string;
  userName: string;
  action: string;
  entityType?: string;
  entityName?: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentItems, setRecentItems] = useState<RecentActivityItem[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingRecentContent, setLoadingRecentContent] = useState(true);
  const [loadingRecentAuditLogs, setLoadingRecentAuditLogs] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoadingMetrics(true);
      setLoadingRecentContent(true);
      setLoadingRecentAuditLogs(true);

      try {
        // Fetch counts
        const pagesCol = collection(db, "pages");
        const filesCol = collection(db, "mediaItems");
        const blocksCol = collection(db, "contentBlocks");
        const usersCol = collection(db, "users");

        const [pagesSnapshot, filesSnapshot, blocksSnapshot, usersSnapshot] = await Promise.all([
          getCountFromServer(pagesCol),
          getCountFromServer(filesCol),
          getCountFromServer(blocksCol),
          getCountFromServer(usersCol),
        ]);
        
        setMetrics({
          totalPages: pagesSnapshot.data().count,
          totalFiles: filesSnapshot.data().count,
          totalContentBlocks: blocksSnapshot.data().count,
          totalUsers: usersSnapshot.data().count,
        });
        setLoadingMetrics(false);

        // Fetch recent content items
        const recentPagesQuery = query(collection(db, "pages"), orderBy("updatedAt", "desc"), limit(3));
        const recentBlocksQuery = query(collection(db, "contentBlocks"), orderBy("updatedAt", "desc"), limit(2));

        const [recentPagesSnap, recentBlocksSnap] = await Promise.all([
          getDocs(recentPagesQuery),
          getDocs(recentBlocksQuery),
        ]);

        const fetchedRecentItems: RecentActivityItem[] = [];

        recentPagesSnap.forEach(doc => {
          const page = doc.data() as PageData;
          fetchedRecentItems.push({
            id: doc.id,
            title: page.title,
            type: "Page",
            lastModified: page.updatedAt instanceof Timestamp ? page.updatedAt.toDate().toLocaleDateString() : 'N/A',
            editor: page.author || 'Unknown',
            url: `/pages`,
            icon: FileText,
          });
        });

        recentBlocksSnap.forEach(doc => {
          const block = doc.data() as ContentBlock;
           fetchedRecentItems.push({
            id: doc.id,
            title: block.name,
            type: "Block",
            lastModified: block.updatedAt instanceof Timestamp ? block.updatedAt.toDate().toLocaleDateString() : 'N/A',
            editor: 'N/A',
            url: `/content-blocks`,
            icon: Grid,
          });
        });
        
        fetchedRecentItems.sort((a, b) => {
            const dateA = new Date(a.lastModified === 'N/A' ? 0 : a.lastModified);
            const dateB = new Date(b.lastModified === 'N/A' ? 0 : b.lastModified);
            return dateB.getTime() - dateA.getTime();
        });
        setRecentItems(fetchedRecentItems.slice(0, 5));
        setLoadingRecentContent(false);

        // Fetch recent audit logs
        const auditLogsQuery = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(5));
        const auditLogsSnapshot = await getDocs(auditLogsQuery);
        const fetchedAuditLogs = auditLogsSnapshot.docs.map(doc => {
            const data = doc.data();
            const ts = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
            return {
                id: doc.id,
                userName: data.userName || data.userId || 'System',
                action: data.action || 'Unknown Action',
                entityType: data.entityType,
                entityName: data.entityName || data.entityId,
                timestamp: ts.toLocaleDateString() + ' ' + ts.toLocaleTimeString(),
            };
        });
        setRecentAuditLogs(fetchedAuditLogs);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingMetrics(false);
        setLoadingRecentContent(false);
        setLoadingRecentAuditLogs(false);
      }
    }
    fetchDashboardData();
  }, []);


  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your Apollo CMS activity." />

      <QuickActions /> 

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loadingMetrics || !metrics ? (
            <>
                <KeyMetricCard title="Total Pages" value={<Loader2 className="h-5 w-5 animate-spin" />} icon={FileText} />
                <KeyMetricCard title="Total Files" value={<Loader2 className="h-5 w-5 animate-spin" />} icon={Files} />
                <KeyMetricCard title="Content Blocks" value={<Loader2 className="h-5 w-5 animate-spin" />} icon={Grid} />
                <KeyMetricCard title="Total Users" value={<Loader2 className="h-5 w-5 animate-spin" />} icon={Users} />
            </>
        ) : (
            <>
                <KeyMetricCard title="Total Pages" value={metrics.totalPages} icon={FileText} description="Published & drafts" />
                <KeyMetricCard title="Total Files" value={metrics.totalFiles} icon={Files} description="In media library" />
                <KeyMetricCard title="Content Blocks" value={metrics.totalContentBlocks} icon={Grid} description="Reusable content units" />
                <KeyMetricCard title="Total Users" value={metrics.totalUsers} icon={Users} description="Registered accounts" />
            </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsChart 
          title="Content Creation Trends" 
          description="Pages, blocks, and files created per week (Placeholder)."
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
          description="Active users and comments per week (Placeholder)."
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
            <CardDescription>Live insights from your Google Analytics property (Placeholder).
              <Button variant="link" size="sm" asChild className="ml-2 p-0 h-auto">
                <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" >
                  Open GA <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
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
                    {loadingRecentContent ? (
                        <div className="flex justify-center items-center h-20">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : recentItems.length > 0 ? (
                        <div className="space-y-2">
                            {recentItems.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                    <div className="flex items-center gap-3">
                                    <ItemIcon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <Link href={item.url} className="font-medium text-sm hover:underline">{item.title}</Link>
                                        <div className="text-xs text-muted-foreground">
                                          <Badge variant="outline" className="mr-1.5 text-xs">{item.type}</Badge>
                                          Modified by {item.editor} &bull; {item.lastModified}
                                        </div>
                                    </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="text-xs shrink-0">
                                    <Link href={item.type === 'Page' ? `/pages?edit=${item.id}` : `/content-blocks?edit=${item.id}`}><Edit2 className="mr-1 h-3 w-3" /> Edit</Link>
                                    </Button>
                                </div>
                              );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recently modified items.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Recent Audit Log Activity
                </CardTitle>
                <CardDescription>A quick glance at the latest system activities.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link href="/audit-logs">
                    <ShieldAlert className="mr-2 h-4 w-4"/> View All Audit Logs
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            {loadingRecentAuditLogs ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : recentAuditLogs.length > 0 ? (
                <ScrollArea className="h-[250px]">
                <div className="space-y-4">
                    {recentAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 mt-1">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${log.userName.substring(0,1)}`} alt={log.userName} data-ai-hint="user avatar" />
                            <AvatarFallback>{log.userName.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                        <p className="text-sm font-medium leading-none">
                            <span className="font-semibold">{log.userName}</span> {log.action.toLowerCase().replace('_', ' ')} {log.entityType && <Badge variant="secondary" className="ml-1 text-xs">{log.entityType}</Badge>} <span className="text-muted-foreground">{log.entityName && log.entityName !== log.id ? `"${log.entityName}"` : ''}</span>.
                        </p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        </div>
                    </div>
                    ))}
                </div>
                </ScrollArea>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent audit log activity.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
