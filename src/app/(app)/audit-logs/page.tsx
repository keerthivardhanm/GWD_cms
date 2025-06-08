import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Filter, Search, Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

const auditLogsData = [
  { id: "log1", user: "Alice Wonderland", action: "Updated Page", entity: "Homepage (ID: 1)", timestamp: "2024-07-28 10:15:23", details: "{ title: 'New Homepage Title' }" },
  { id: "log2", user: "Bob The Builder", action: "Created Block", entity: "Hero Banner - Homepage (ID: cb1)", timestamp: "2024-07-28 09:30:05", details: "{ type: 'Hero Section', content: '...' }" },
  { id: "log3", user: "Admin", action: "Changed Setting", entity: "Site Favicon", timestamp: "2024-07-27 15:00:00", details: "{ new_value: 'favicon.ico' }" },
  { id: "log4", user: "Charlie Brown", action: "Uploaded Media", entity: "team-photo.jpg (ID: m4)", timestamp: "2024-07-27 14:10:50", details: "{ size: '850KB' }" },
  { id: "log5", user: "Alice Wonderland", action: "Deleted File", entity: "Old Product Data (ID: cf_old)", timestamp: "2024-07-26 11:05:12", details: "Permanently deleted" },
];

export default function AuditLogsPage() {
  // Placeholder for date state
  // const [date, setDate] = React.useState<DateRange | undefined>();

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
                  <SelectItem value="alice">Alice Wonderland</SelectItem>
                  <SelectItem value="bob">Bob The Builder</SelectItem>
                  <SelectItem value="charlie">Charlie Brown</SelectItem>
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
                  <Calendar mode="range" numberOfMonths={2} />
                </PopoverContent>
              </Popover>
               <Button variant="outline" size="icon" aria-label="Apply Filters">
                  <Filter className="h-4 w-4" />
               </Button>
            </div>
          </div>
        
          <div className="overflow-x-auto">
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
                {auditLogsData.map((log) => (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
