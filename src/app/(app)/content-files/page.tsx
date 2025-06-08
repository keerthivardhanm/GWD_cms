import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Trash2, Layers, Clock, ShieldAlert } from "lucide-react";

const contentFilesData = [
  { id: "cf1", name: "Blog Post Schema", attachedTo: "Multiple Pages", blocks: 15, lastUpdated: "2024-07-28", versions: 5 },
  { id: "cf2", name: "Product Details", attachedTo: "Product Pages", blocks: 8, lastUpdated: "2024-07-25", versions: 2 },
  { id: "cf3", name: "Homepage Hero", attachedTo: "Homepage", blocks: 3, lastUpdated: "2024-07-29", versions: 8 },
  { id: "cf4", name: "Testimonial Slider", attachedTo: "Various Sections", blocks: 12, lastUpdated: "2024-07-15", versions: 3 },
];

export default function ContentFilesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Files (Modules)"
        description="Manage reusable content structures and their versions."
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search content files..." className="pl-8 sm:w-[300px]" />
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New File
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden md:table-cell">Attached To</TableHead>
                <TableHead className="text-center">Blocks</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Versions</TableHead>
                <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentFilesData.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{file.attachedTo}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{file.blocks}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                     <Badge variant="outline">{file.versions}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{file.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                           <span className="sr-only">Content file actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions for {file.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit Schema
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Layers className="mr-2 h-4 w-4" /> Manage Content Blocks
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                          <Clock className="mr-2 h-4 w-4" /> View Version History
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShieldAlert className="mr-2 h-4 w-4" /> View Stats & Usage
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete File
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
