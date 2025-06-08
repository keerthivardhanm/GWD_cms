
"use client";

import React, { useEffect, useState } from "react";
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
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  timestamp: string; // Display string
  details: string;
}

export default function AuditLogsPage() {
  const [date, setDate] = useState<DateRange | undefined>();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "auditLogs"));
        const logsData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            user: data.user || 'Unknown User',
            action: data.action || 'Unknown Action',
            entity: data.entity || 'N/A',
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toLocaleString() : (data.timestamp || 'N/A'),
            details: data.details || '',
          } as AuditLog;
        });
        setAuditLogs(logsData);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError("Failed to load audit logs. Please ensure the 'auditLogs' collection exists and has data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all changes made within the CMS."
        actions={
          <>
            <Button variant="outline">
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
              <Input type="search" placeholder="Search logs by user, action, or entity..." className="pl-8 w-full" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {/* Dynamically populate users if needed */}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <CalendarIcon className="mr-2 h-4 w-4" /> Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="range" 
                    numberOfMonths={2}
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
               <Button variant="outline" size="icon" aria-label="Apply Filters">
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
            {!loading && !error && auditLogs.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">No audit logs found.</p>
            )}
            {!loading && !error && auditLogs.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="min-w-[200px]">Entity</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[200px]">Details</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{log.entity}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs truncate max-w-xs">{log.details}</TableCell>
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
