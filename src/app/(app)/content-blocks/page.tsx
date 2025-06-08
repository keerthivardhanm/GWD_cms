import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Copy, Trash2, Eye, ToggleLeft, ToggleRight, History, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


const contentBlocksData = [
  { id: "cb1", name: "Hero Banner - Homepage", type: "Hero Section", status: "Published", version: 3, lastModified: "2024-07-28" },
  { id: "cb2", name: "Product Feature List", type: "Feature List", status: "Draft", version: 1, lastModified: "2024-07-25" },
  { id: "cb3", name: "Call to Action - Footer", type: "CTA", status: "Published", version: 5, lastModified: "2024-07-20" },
  { id: "cb4", name: "Testimonial Card", type: "Testimonial", status: "Published", version: 2, lastModified: "2024-07-15" },
];

export default function ContentBlocksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Blocks"
        description="Manage individual content blocks and their versions."
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search blocks..." className="pl-8 sm:w-[300px]" />
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Block
            </Button>
          </>
        }
      />

    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Block Name</TableHead>
                        <TableHead className="hidden md:table-cell">Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell text-center">Version</TableHead>
                        <TableHead className="hidden lg:table-cell">Last Modified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {contentBlocksData.map((block) => (
                        <TableRow key={block.id}>
                        <TableCell className="font-medium">{block.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{block.type}</TableCell>
                        <TableCell>
                            <Badge variant={block.status === "Published" ? "default" : "secondary"}
                            className={block.status === "Published" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                            >
                            {block.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center">
                            <Badge variant="outline">{block.version}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{block.lastModified}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Block actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions for {block.name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Content
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" /> Configure Block
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" /> Duplicate Block
                                </DropdownMenuItem>
                                 <DropdownMenuItem>
                                <History className="mr-2 h-4 w-4" /> View Version History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex items-center">
                                {block.status === "Published" ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                 Set to {block.status === "Published" ? "Draft" : "Published"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Block
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Dynamic Form (Placeholder)</CardTitle>
                    <CardDescription>Form for editing selected block will appear here based on its schema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="field1">Field 1 (e.g. Title)</Label>
                        <Input id="field1" placeholder="Enter title" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="field2">Field 2 (e.g. Description)</Label>
                        <Input id="field2" placeholder="Enter description" />
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="publish-toggle" />
                        <Label htmlFor="publish-toggle">Publish Block</Label>
                    </div>
                    <Button className="w-full">Save Changes</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center p-4">
                        <p className="text-muted-foreground text-center">Selected block will render here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>


    </div>
  );
}
