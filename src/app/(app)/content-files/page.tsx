
"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Trash2, Layers, Clock, ShieldAlert, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';

interface ContentFile {
  id: string;
  name: string;
  attachedTo: string;
  blocks: number;
  lastUpdated: string; 
  versions: number;
}

export default function ContentFilesPage() {
  const [allContentFiles, setAllContentFiles] = useState<ContentFile[]>([]);
  const [filteredContentFiles, setFilteredContentFiles] = useState<ContentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchContentFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "contentFiles"));
        const filesData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unnamed File',
            attachedTo: data.attachedTo || 'N/A',
            blocks: data.blocks || 0,
            lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate().toLocaleDateString() : (data.lastUpdated || new Date().toLocaleDateString()),
            versions: data.versions || 1,
          } as ContentFile;
        });
        setAllContentFiles(filesData);
        setFilteredContentFiles(filesData);
      } catch (err) {
        console.error("Error fetching content files:", err);
        setError("Failed to load content files. Please ensure the 'contentFiles' collection exists and has data.");
      } finally {
        setLoading(false);
      }
    };

    fetchContentFiles();
  }, []);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allContentFiles.filter(file => 
      file.name.toLowerCase().includes(lowerSearchTerm) ||
      file.attachedTo.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredContentFiles(filtered);
  }, [searchTerm, allContentFiles]);

  const NoFilesMessage = () => {
    if (searchTerm && filteredContentFiles.length === 0 && allContentFiles.length > 0) {
        return `No content files found matching "${searchTerm}".`;
    }
    return "No content files found. Click \"Create New File\" to get started.";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Files (Modules)"
        description="Manage reusable content structures and their versions."
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search content files..." 
                className="pl-8 sm:w-[250px] md:w-[300px] w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New File
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading content files...</p>
            </div>
          )}
          {error && <p className="p-4 text-center text-destructive">{error}</p>}
          {!loading && !error && allContentFiles.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">No content files found.</p>
          )}
          {!loading && !error && allContentFiles.length > 0 && filteredContentFiles.length === 0 && (
             <p className="p-4 text-center text-muted-foreground">
                <NoFilesMessage />
            </p>
          )}
          {!loading && !error && filteredContentFiles.length > 0 && (
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
                {filteredContentFiles.map((file) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
