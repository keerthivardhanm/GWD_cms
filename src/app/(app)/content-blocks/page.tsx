
"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Copy, Trash2, Eye, ToggleLeft, ToggleRight, History, Settings, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';

interface ContentBlock {
  id: string;
  name: string;
  type: string;
  status: "Published" | "Draft" | string; // Allow string for flexibility if other statuses exist
  version: number;
  lastModified: string; // Display string
}

export default function ContentBlocksPage() {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContentBlocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "contentBlocks"));
        const blocksData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unnamed Block',
            type: data.type || 'Generic',
            status: data.status || 'Draft',
            version: data.version || 1,
            lastModified: data.lastModified instanceof Timestamp ? data.lastModified.toDate().toLocaleDateString() : (data.lastModified || new Date().toLocaleDateString()),
          } as ContentBlock;
        });
        setContentBlocks(blocksData);
      } catch (err) {
        console.error("Error fetching content blocks:", err);
        setError("Failed to load content blocks. Please ensure the 'contentBlocks' collection exists and has data.");
      } finally {
        setLoading(false);
      }
    };

    fetchContentBlocks();
  }, []);

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
                {loading && (
                  <div className="flex items-center justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Loading content blocks...</p>
                  </div>
                )}
                {error && <p className="p-4 text-center text-destructive">{error}</p>}
                {!loading && !error && contentBlocks.length === 0 && (
                  <p className="p-4 text-center text-muted-foreground">No content blocks found.</p>
                )}
                {!loading && !error && contentBlocks.length > 0 && (
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
                      {contentBlocks.map((block) => (
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
                )}
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
