
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Copy, Trash2, Eye, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, QueryDocumentSnapshot, DocumentData, Timestamp, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { PageForm, PageFormValues, PageStatus, PageType } from '@/components/forms/PageForm';
import { HomePageContentType } from '@/schemas/pages/homePageSchema';
import { AboutUsPageContentType } from '@/schemas/pages/aboutUsPageSchema';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Define base page structure
interface BasePage {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  lastModified: string; 
  author: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  pageType: PageType; 
}

// Define specific page types with their content
export interface GenericPageData {
  // Currently no specific fields for generic pages, but can be extended
  [key: string]: any; 
}
export interface GenericPage extends BasePage {
  pageType: 'generic';
  content?: GenericPageData; 
}

export interface HomePage extends BasePage {
  pageType: 'home';
  content: HomePageContentType;
}

export interface AboutUsPage extends BasePage {
  pageType: 'about-us';
  content: AboutUsPageContentType;
}

// Union type for all possible page structures
export type Page = GenericPage | HomePage | AboutUsPage;

export default function PagesManagementPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, userData } = useAuth(); // Get user data for role check

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const isAdmin = userData?.role === 'Admin';

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pagesQuery = query(collection(db, "pages"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(pagesQuery);
      const pagesData = querySnapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnap.data();
        let lastModifiedStr = data.updatedAt instanceof Timestamp 
                              ? data.updatedAt.toDate().toLocaleDateString() 
                              : (data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString());
        
        const baseData = {
          id: docSnap.id,
          title: data.title || '',
          slug: data.slug || '',
          status: data.status || 'Draft',
          lastModified: lastModifiedStr,
          author: data.author || 'Unknown',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          pageType: data.pageType || 'generic', // Default to generic
        };

        if (baseData.pageType === 'home') {
          return { ...baseData, pageType: 'home', content: data.content || {} } as HomePage;
        } else if (baseData.pageType === 'about-us') {
          return { ...baseData, pageType: 'about-us', content: data.content || {} } as AboutUsPage;
        }
        // Add more specific page types here
        return { ...baseData, pageType: 'generic', content: data.content || {} } as GenericPage;
      });
      setPages(pagesData);
    } catch (err) {
      console.error("Error fetching pages:", err);
      setError("Failed to load pages. Please ensure the 'pages' collection exists and try again.");
      toast({
        title: "Error",
        description: "Failed to load pages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleCreateNewPage = () => {
    if (!isAdmin) {
      toast({ title: "Permission Denied", description: "You do not have permission to create pages.", variant: "destructive" });
      return;
    }
    setEditingPage(null);
    setIsFormOpen(true);
  };

  const handleEditPage = (page: Page) => {
     if (!isAdmin) {
      toast({ title: "Permission Denied", description: "You do not have permission to edit pages.", variant: "destructive" });
      return;
    }
    setEditingPage(page);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: PageFormValues, pageType: PageType, content?: any) => {
    if (!isAdmin) {
      toast({ title: "Permission Denied", description: "You do not have permission to save pages.", variant: "destructive" });
      return;
    }
    try {
      const dataToSave: any = {
        ...values,
        pageType,
        content: content || {}, // Ensure content is an empty object if undefined
        updatedAt: serverTimestamp(),
      };

      if (editingPage) {
        const pageRef = doc(db, "pages", editingPage.id);
        await updateDoc(pageRef, dataToSave);
        toast({
          title: "Success",
          description: "Page updated successfully.",
        });
      } else {
        dataToSave.createdAt = serverTimestamp();
        await addDoc(collection(db, "pages"), dataToSave);
        toast({
          title: "Success",
          description: "Page created successfully.",
        });
      }
      setIsFormOpen(false);
      setEditingPage(null);
      fetchPages(); 
    } catch (err) {
      console.error("Error saving page:", err);
      toast({
        title: "Error",
        description: `Failed to save page. ${err instanceof Error ? err.message : ''}`,
        variant: "destructive",
      });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!isAdmin) {
      toast({ title: "Permission Denied", description: "You do not have permission to delete pages.", variant: "destructive" });
      return;
    }
    try {
      await deleteDoc(doc(db, "pages", pageId));
      toast({
        title: "Success",
        description: "Page deleted successfully.",
      });
      fetchPages(); 
    } catch (err) {
      console.error("Error deleting page:", err);
      toast({
        title: "Error",
        description: `Failed to delete page. ${err instanceof Error ? err.message : ''}`,
        variant: "destructive",
      });
    }
  };

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
            {isAdmin && (
              <Button onClick={handleCreateNewPage}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Page
              </Button>
            )}
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
            <p className="p-4 text-center text-muted-foreground">No pages found. Click "Create New Page" to get started.</p>
          )}
          {!loading && !error && pages.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{page.slug}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground capitalize">
                        {page.pageType.replace('-', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.status === "Published" ? "default" : page.status === "Draft" ? "secondary" : "outline"}
                        className={page.status === "Published" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                      >
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{page.lastModified}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="mr-2" onClick={() => alert('Preview not implemented yet.')}>
                        <Eye className="h-4 w-4 mr-1" /> Preview
                      </Button>
                      {isAdmin && (
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
                            <DropdownMenuItem onClick={() => handleEditPage(page)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit Page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert('Duplicate not implemented yet.')}>
                              <Copy className="mr-2 h-4 w-4" /> Duplicate Page
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Page
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the page "{page.title}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePage(page.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingPage(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
            <DialogDescription>
              {editingPage ? "Make changes to your page here." : "Fill in the details for your new page."} Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <PageForm
            onSubmit={handleFormSubmit}
            initialData={editingPage}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPage(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
