
"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Copy, Trash2, Eye, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: "Published" | "Draft" | "Review";
  lastModified: string; 
  author: string;
}

export default function PagesManagementPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "pages"));
        const pagesData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          // Ensure lastModified is handled correctly, whether it's a string or Timestamp
          let lastModifiedStr = data.lastModified;
          if (data.lastModified instanceof Timestamp) {
            lastModifiedStr = data.lastModified.toDate().toLocaleDateString();
          }
          return {
            id: doc.id,
            title: data.title || '',
            slug: data.slug || '',
            status: data.status || 'Draft',
            lastModified: lastModifiedStr || new Date().toLocaleDateString(),
            author: data.author || 'Unknown',
          } as Page;
        });
        setPages(pagesData);
      } catch (err) {
        console.error("Error fetching pages:", err);
        setError("Failed to load pages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

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
          {loading && (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading pages...</p>
            </div>
          )}
          {error && <p className="p-4 text-center text-destructive">{error}</p>}
          {!loading && !error && pages.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">No pages found.</p>
          )}
          {!loading && !error && pages.length > 0 && (
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
                {pages.map((page) => (
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
                            <span className="sr-only">Page actions for {page.title}</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
