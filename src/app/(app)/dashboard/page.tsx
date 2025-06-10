
"use client";

import Link from 'next/link';
import { PageHeader } from "@/components/shared/PageHeader";
import { KeyMetricCard } from "@/components/dashboard/KeyMetricsCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { KeepNotes } from "@/components/dashboard/KeepNotes";
import type { RecentActivityItem } from "@/components/dashboard/RecentActivityFeed"; // Keep this for future if needed elsewhere
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FileText, Files, Grid, BarChart3, Users, ExternalLink, Edit2, Package, Settings, FileClock, Loader2, ListChecks, ShieldAlert, Activity, UserPlus } from "lucide-react";
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
import { fetchGaData, type GaDataOutput } from '@/ai/flows/fetch-ga-data-flow';


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

// Define a type for structured GA errors based on the flow's output
type GaErrorType = {
  code: string;
  message: string;
} | null;


export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentItems, setRecentItems] = useState<RecentActivityItem[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLogEntry[]>([]);
  const [gaData, setGaData] = useState<GaDataOutput | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingRecentContent, setLoadingRecentContent] = useState(true);
  const [loadingRecentAuditLogs, setLoadingRecentAuditLogs] = useState(true);
  const [loadingGaData, setLoadingGaData] = useState(true);
  const [gaError, setGaError] = useState<string | null>(null); // Store only the message string for UI

  useEffect(() => {
    async function fetchDashboardData() {
      setLoadingMetrics(true);
      setLoadingRecentContent(true);
      setLoadingRecentAuditLogs(true);
      setLoadingGaData(true);
      setGaError(null); // Reset GA error on new fetch attempt

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

        // Fetch GA Data
        const gaResult = await fetchGaData();
        if (gaResult.error) {
          setGaError(gaResult.error.message); // Store the message for UI display
          // Conditional console logging
          const knownConfigErrors = ['MISSING_GA_PROPERTY_ID', 'MISSING_CREDENTIALS_STRING', 'INVALID_CREDENTIALS_JSON'];
          if (!knownConfigErrors.includes(gaResult.error.code)) {
            console.error(`GA Data Fetch Error (${gaResult.error.code}): ${gaResult.error.message}`);
          }
        } else {
          setGaData(gaResult);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set specific errors if needed, or a general one
      } finally {
        setLoadingMetrics(false);
        setLoadingRecentContent(false);
        setLoadingRecentAuditLogs(false);
        setLoadingGaData(false);
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
                <KeyMetricCard title="Total Media Files" value={<Loader2 className="h-5 w-5 animate-spin" />} icon={Files} />
                <KeyMetricCard title="Content Blocks" value={<Loader2 className="h-5 w-5 animate-spin" />} icon={Grid} />
                <KeyMetricCard title="Total Users" value={<Loader2 className="h-5 w-5 animate-spin" />} icon={Users} />
            </>
        ) : (
            <>
                <KeyMetricCard title="Total Pages" value={metrics.totalPages} icon={FileText} description="Published & drafts" />
                <KeyMetricCard title="Total Media Files" value={metrics.totalFiles} icon={Files} description="In media library" />
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
            <CardDescription>
              Insights from your Google Analytics property (Last 7 days).
              <Button variant="link" size="sm" asChild className="ml-2 p-0 h-auto">
                <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" >
                  Open GA <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingGaData && (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading Google Analytics data...</p>
              </div>
            )}
            {gaError && !loadingGaData && (
              <Card className="border-destructive bg-destructive/5 text-destructive">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" /> GA Data Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">Failed to load Google Analytics data:</p>
                  <p className="text-sm mb-2">{gaError}</p>
                  <p className="text-xs ">
                    Please ensure `GA_PROPERTY_ID` and `GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING` 
                    are correctly set in your `.env.local` file (restart server after changes). 
                    Also, verify the service account has 'Viewer' permission on the GA property in Google Analytics admin settings.
                  </p>
                </CardContent>
              </Card>
            )}
            {!loadingGaData && !gaError && gaData && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <KeyMetricCard title="Active Users (7d)" value={gaData.activeUsers || '0'} icon={Users} />
                  <KeyMetricCard title="New Users (7d)" value={gaData.newUsers || '0'} icon={UserPlus} />
                  <KeyMetricCard title="Page Views (7d)" value={gaData.screenPageViews || '0'} icon={Activity} />
                </div>
                
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Top Pages (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {gaData.topPages && gaData.topPages.length > 0 ? (
                        <ScrollArea className="h-[150px]">
                          <ul className="space-y-2 text-sm">
                            {gaData.topPages.map(p => (
                              <li key={p.pagePath} className="flex justify-between items-center">
                                <span className="truncate" title={p.pagePath}>{p.pagePath}</span>
                                <Badge variant="secondary">{p.screenPageViews} views</Badge>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      ) : (
                        <p className="text-sm text-muted-foreground">No top pages data available or no views recorded.</p>
                      )}
                    </CardContent>
                </Card>
              </div>
            )}
            {!loadingGaData && !gaError && !gaData && (
                 <p className="p-4 text-center text-muted-foreground">No Google Analytics data available.</p>
            )}
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
                        <div className="text-sm font-medium leading-none">
                            <span className="font-semibold">{log.userName}</span> {log.action.toLowerCase().replace(/_/g, ' ')} {log.entityType && <Badge variant="secondary" className="ml-1 text-xs align-middle">{log.entityType}</Badge>} <span className="text-muted-foreground">{log.entityName && log.entityName !== log.id ? `"${log.entityName}"` : ''}</span>.
                        </div>
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
