import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Copy, Trash2, Eye } from "lucide-react";

const pagesData = [
  { id: "1", title: "Homepage", slug: "/", status: "Published", lastModified: "2024-07-28", author: "Admin" },
  { id: "2", title: "About Us", slug: "/about", status: "Draft", lastModified: "2024-07-25", author: "Editor" },
  { id: "3", title: "Services", slug: "/services", status: "Published", lastModified: "2024-07-20", author: "Admin" },
  { id: "4", title: "Contact", slug: "/contact", status: "Published", lastModified: "2024-07-15", author: "Admin" },
  { id: "5", title: "Blog", slug: "/blog", status: "Review", lastModified: "2024-07-29", author: "Editor" },
];

export default function PagesManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Page Management"
        description="Create, edit, and manage your website pages."
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search pages..." className="pl-8 sm:w-[300px]" />
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Page
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last Modified</TableHead>
                <TableHead className="hidden lg:table-cell">Author</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagesData.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant={page.status === "Published" ? "default" : page.status === "Draft" ? "secondary" : "outline"}
                      className={page.status === "Published" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                    >
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{page.lastModified}</TableCell>
                  <TableCell className="hidden lg:table-cell">{page.author}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="mr-2">
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Page actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit Page
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate Page
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Page
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

// Minimal Card component to wrap table if not already globally available
// This is typically part of shadcn/ui but defining minimally if needed standalone for this snippet
// For a full app, ensure Card, CardContent are imported from "@/components/ui/card"
const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

