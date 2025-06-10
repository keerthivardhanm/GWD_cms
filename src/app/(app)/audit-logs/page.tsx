
"use client";

import React, { useEffect, useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Filter, Search, Download, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp, query, orderBy } from 'firebase/firestore';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  timestamp: string; // Display string
  originalTimestamp: Date; // For reliable date filtering
  details: Record<string, any> | string;
}

export default function AuditLogsPage() {
  const [allAuditLogs, setAllAuditLogs] = useState<AuditLog[]>([]);
  const [filteredAuditLogs, setFilteredAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const auditLogsQuery = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(auditLogsQuery);
        const logsData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          const originalTs = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp || Date.now());
          
          return {
            id: doc.id,
            user: data.userName || data.userId || 'Unknown User',
            action: data.action || 'Unknown Action',
            entityType: data.entityType || 'N/A',
            entityId: data.entityId || 'N/A',
            entityName: data.entityName || data.entityId,
            timestamp: originalTs.toLocaleString(),
            originalTimestamp: originalTs,
            details: data.details || {},
          } as AuditLog;
        });
        setAllAuditLogs(logsData);
        setFilteredAuditLogs(logsData); // Initially, show all logs
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError("Failed to load audit logs. Please ensure the 'auditLogs' collection exists and has data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const uniqueUsers = useMemo(() => {
    const users = new Set(allAuditLogs.map(log => log.user));
    return Array.from(users).sort();
  }, [allAuditLogs]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(allAuditLogs.map(log => log.action));
    return Array.from(actions).sort();
  }, [allAuditLogs]);


  useEffect(() => {
    let logs = [...allAuditLogs];

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      logs = logs.filter(log =>
        log.user.toLowerCase().includes(lowerSearchTerm) ||
        log.action.toLowerCase().includes(lowerSearchTerm) ||
        log.entityType.toLowerCase().includes(lowerSearchTerm) ||
        (log.entityName && log.entityName.toLowerCase().includes(lowerSearchTerm)) ||
        log.entityId.toLowerCase().includes(lowerSearchTerm) ||
        (typeof log.details === 'string' ? log.details.toLowerCase().includes(lowerSearchTerm) : JSON.stringify(log.details).toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Filter by user
    if (selectedUser !== "all") {
      logs = logs.filter(log => log.user === selectedUser);
    }

    // Filter by action
    if (selectedAction !== "all") {
      logs = logs.filter(log => log.action === selectedAction);
    }

    // Filter by date range
    if (dateRange?.from) {
      logs = logs.filter(log => log.originalTimestamp >= dateRange.from!);
    }
    if (dateRange?.to) {
      // Adjust 'to' date to include the entire day
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      logs = logs.filter(log => log.originalTimestamp <= toDate);
    }

    setFilteredAuditLogs(logs);
  }, [searchTerm, selectedUser, selectedAction, dateRange, allAuditLogs]);


  const formatDetails = (details: Record<string, any> | string): string => {
    if (typeof details === 'string') {
      return details;
    }
    if (typeof details === 'object' && details !== null) {
      return JSON.stringify(details);
    }
    return '';
  };
  
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedUser("all");
    setSelectedAction("all");
    setDateRange(undefined);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all changes made within the CMS."
        actions={
          <>
            <Button variant="outline" onClick={() => alert("Export Logs functionality TBD.")}>
              <Download className="mr-2 h-4 w-4" /> Export Logs
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search logs by user, action, or entity..." 
                className="pl-8 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                     <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <CalendarIcon className="mr-2 h-4 w-4" /> 
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                      ) : (
                        dateRange.from.toLocaleDateString()
                      )
                    ) : (
                      "Date Range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="range" 
                    numberOfMonths={2}
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
               <Button variant="outline" size="icon" aria-label="Reset Filters" onClick={handleResetFilters} title="Reset Filters">
                  <Filter className="h-4 w-4" />
               </Button>
            </div>
          </div>
        
          <div className="overflow-x-auto">
            {loading && (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading audit logs...</p>
              </div>
            )}
            {error && <p className="p-4 text-center text-destructive">{error}</p>}
            {!loading && !error && allAuditLogs.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">No audit logs found.</p>
            )}
            {!loading && !error && allAuditLogs.length > 0 && filteredAuditLogs.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">No audit logs match the current filters.</p>
            )}
            {!loading && !error && filteredAuditLogs.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="min-w-[150px]">Entity Type</TableHead>
                    <TableHead className="min-w-[200px]">Entity Name/ID</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[200px]">Details</TableHead>
                    <TableHead className="text-right min-w-[150px]">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{log.entityType}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{log.entityName || log.entityId}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs truncate max-w-xs">
                        {formatDetails(log.details)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

