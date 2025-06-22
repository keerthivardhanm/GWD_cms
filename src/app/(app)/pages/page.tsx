
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Copy, Trash2, Eye, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, QueryDocumentSnapshot, DocumentData, Timestamp, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { PageForm, PageFormValues, PageStatus, PageType } from '@/components/forms/PageForm';
import type { HomePageContentType } from '@/schemas/pages/homePageSchema';
import type { AboutUsPageContentType } from '@/schemas/pages/aboutUsPageSchema';
import type { AdmissionsPageContentType } from '@/schemas/pages/admissionsPageSchema';
import type { ContactPageContentType } from '@/schemas/pages/contactPageSchema';
import type { ProgramsListingPageContentType } from '@/schemas/pages/programsListingPageSchema';
import type { IndividualProgramPageContentType } from '@/schemas/pages/individualProgramPageSchema';
import type { CentresOverviewPageContentType } from '@/schemas/pages/centresOverviewPageSchema';
import type { IndividualCentrePageContentType } from '@/schemas/pages/individualCentrePageSchema';
import type { EnquiryPageContentType } from '@/schemas/pages/enquiryPageSchema';

import { useAuth } from '@/context/AuthContext';
import { logAuditEvent } from '@/lib/auditLogger';

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
  mainContent?: string;
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

export interface AdmissionsPage extends BasePage {
  pageType: 'admissions';
  content: AdmissionsPageContentType;
}

export interface ContactPage extends BasePage {
  pageType: 'contact';
  content: ContactPageContentType;
}

export interface ProgramsListingPage extends BasePage {
  pageType: 'programs';
  content: ProgramsListingPageContentType;
}

export interface IndividualProgramPage extends BasePage {
  pageType: 'program-detail';
  content: IndividualProgramPageContentType;
}
export interface CentresOverviewPage extends BasePage {
  pageType: 'centres';
  content: CentresOverviewPageContentType;
}
export interface IndividualCentrePage extends BasePage {
  pageType: 'centre-detail';
  content: IndividualCentrePageContentType;
}
export interface EnquiryPage extends BasePage {
  pageType: 'enquiry';
  content: EnquiryPageContentType;
}


// Union type for all possible page structures
export type Page =
  | GenericPage
  | HomePage
  | AboutUsPage
  | AdmissionsPage
  | ContactPage
  | ProgramsListingPage
  | IndividualProgramPage
  | CentresOverviewPage
  | IndividualCentrePage
  | EnquiryPage;


export default function PagesManagementPage() {
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, userData } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [searchTerm, setSearchTerm] = useState("");


  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pagesQuery = query(collection(db, "pages"), orderBy("updatedAt", "desc"));
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
          pageType: data.pageType || 'generic',
          content: data.content || {},
        };

        switch (baseData.pageType) {
          case 'home':
            return { ...baseData, content: data.content || {} } as HomePage;
          case 'about-us':
            return { ...baseData, content: data.content || {} } as AboutUsPage;
          case 'admissions':
            return { ...baseData, content: data.content || {} } as AdmissionsPage;
          case 'contact':
            return { ...baseData, content: data.content || {} } as ContactPage;
          case 'programs':
            return { ...baseData, content: data.content || {} } as ProgramsListingPage;
          case 'program-detail':
            return { ...baseData, content: data.content || {} } as IndividualProgramPage;
          case 'centres':
            return { ...baseData, content: data.content || {} } as CentresOverviewPage;
          case 'centre-detail':
            return { ...baseData, content: data.content || {} } as IndividualCentrePage;
          case 'enquiry':
            return { ...baseData, content: data.content || {} } as EnquiryPage;
          default: 
            return { ...baseData, content: data.content || { mainContent: ''} } as GenericPage;
        }
      });
      setAllPages(pagesData);
      setFilteredPages(pagesData); 
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

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allPages.filter(page => 
      page.title.toLowerCase().includes(lowerSearchTerm) ||
      page.slug.toLowerCase().includes(lowerSearchTerm) ||
      page.pageType.toLowerCase().includes(lowerSearchTerm) ||
      page.author.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredPages(filtered);
  }, [searchTerm, allPages]);

  const handleCreateNewPage = () => {
    setEditingPage(null);
    setIsFormOpen(true);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setIsFormOpen(true);
  };
  
  const handlePreviewPage = (page: Page) => {
    let previewSlug = page.slug;
    if (page.pageType === 'home' && (!page.slug || page.slug === 'home')) {
        previewSlug = 'home'; 
    }
    if (!previewSlug) {
        toast({ title: "Preview Error", description: "Page slug is missing, cannot generate preview link.", variant: "destructive" });
        return;
    }
    window.open(`/preview/${previewSlug}`, '_blank');
  };

  const handleDuplicatePage = async (pageToDuplicate: Page) => {
    try {
      const docRef = doc(db, 'pages', pageToDuplicate.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        toast({ title: "Error", description: "Original page not found.", variant: "destructive" });
        return;
      }
      
      const originalData = docSnap.data();
      const newPageData = {
          ...originalData,
          title: `${originalData.title} (Copy)`,
          slug: `${originalData.slug}-copy-${Date.now()}`, // Ensure unique slug
          status: 'Draft' as PageStatus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          author: userData?.name || user?.email || 'System',
      };

      const newDocRef = await addDoc(collection(db, "pages"), newPageData);
      await logAuditEvent(user, userData, 'PAGE_DUPLICATED', 'Page', newDocRef.id, newPageData.title, { originalPageId: pageToDuplicate.id });
      
      toast({ title: "Page Duplicated", description: `"${pageToDuplicate.title}" was successfully duplicated.` });
      fetchPages(); // Refresh the list

    } catch (err) {
       console.error("Error duplicating page:", err);
       toast({ title: "Error", description: `Failed to duplicate page. ${err instanceof Error ? err.message : ''}`, variant: "destructive" });
    }
  };


  const handleFormSubmit = async (values: PageFormValues, pageType: PageType, contentData?: any) => {
    try {
      const dataToSave: any = {
        ...values, 
        content: contentData || {},
        updatedAt: serverTimestamp(),
        author: values.author || userData?.name || user?.email || 'Admin',
      };

      if (editingPage) {
        const pageRef = doc(db, "pages", editingPage.id);
        if (editingPage.createdAt) { 
            dataToSave.createdAt = editingPage.createdAt; 
        } else if (!dataToSave.createdAt) { 
             dataToSave.createdAt = serverTimestamp(); 
        }

        await updateDoc(pageRef, dataToSave);
        await logAuditEvent(user, userData, 'PAGE_UPDATED', 'Page', editingPage.id, values.title, { newValues: values, newContentSummary: Object.keys(contentData || {}).join(', ') });
        toast({
          title: "Success",
          description: "Page updated successfully.",
        });
      } else {
        dataToSave.createdAt = serverTimestamp();
        const newDocRef = await addDoc(collection(db, "pages"), dataToSave);
        await logAuditEvent(user, userData, 'PAGE_CREATED', 'Page', newDocRef.id, values.title, { values, contentSummary: Object.keys(contentData || {}).join(', ') });
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
    try {
      const pageRef = doc(db, "pages", pageId);
      const pageSnap = await getDoc(pageRef);
      const pageTitle = pageSnap.exists() ? pageSnap.data().title : pageId;

      await deleteDoc(doc(db, "pages", pageId));
      await logAuditEvent(user, userData, 'PAGE_DELETED', 'Page', pageId, pageTitle);
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

  const NoPagesMessage = () => {
    if (searchTerm && filteredPages.length === 0 && allPages.length > 0) {
        return `No pages found matching "${searchTerm}".`;
    }
    return "No pages found. Click \"Create New Page\" to get started.";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Page Management"
        description="Create, edit, and manage your website pages."
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search pages..." 
                className="pl-8 sm:w-[250px] md:w-[300px] w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {user && ( 
                <Button onClick={handleCreateNewPage} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Page
                </Button>
            )}
          </div>
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
          {!loading && !error && allPages.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              No pages found. Click "Create New Page" to get started.
            </p>
          )}
           {!loading && !error && allPages.length > 0 && filteredPages.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              <NoPagesMessage />
            </p>
          )}
          {!loading && !error && filteredPages.length > 0 && (
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
                {filteredPages.map((page) => (
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
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handlePreviewPage(page)}>
                        <ExternalLink className="h-4 w-4 mr-1" /> Data Preview
                      </Button>
                      {user && ( 
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
                            <DropdownMenuItem onClick={() => handleDuplicatePage(page)}>
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
          if (!isOpen) { 
            setEditingPage(null); 
          }
      }}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
            <DialogDescription>
              {editingPage ? "Make changes to your page here." : "Fill in the details for your new page."} Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {isFormOpen && ( 
            <PageForm
              key={editingPage ? `edit-${editingPage.id}-${editingPage.pageType}` : `create-new-page-${Date.now()}`}
              onSubmit={handleFormSubmit}
              initialData={editingPage}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingPage(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
