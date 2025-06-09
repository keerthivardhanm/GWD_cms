
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Trash2, ToggleLeft, ToggleRight, Settings, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, QueryDocumentSnapshot, DocumentData, Timestamp, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { logAuditEvent } from '@/lib/auditLogger';
import { ContentBlockForm, ContentBlockFormValues, ContentBlockStatus, contentBlockStatuses, contentBlockTypes, ContentBlockType } from '@/components/forms/ContentBlockForm';

export interface ContentBlock {
  id: string;
  name: string;
  type: ContentBlockType;
  status: ContentBlockStatus; 
  content: string; // For simple text content, can be expanded later
  version?: number; // Optional for now
  lastModified?: string; // Display string
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function ContentBlocksPage() {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, userData } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);


  const fetchContentBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blocksQuery = query(collection(db, "contentBlocks"), orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(blocksQuery);
      const blocksData = querySnapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Unnamed Block',
          type: data.type || 'Generic',
          status: data.status || 'Draft',
          content: data.content || '',
          version: data.version || 1,
          lastModified: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toLocaleDateString() : (data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as ContentBlock;
      });
      setContentBlocks(blocksData);
    } catch (err) {
      console.error("Error fetching content blocks:", err);
      setError("Failed to load content blocks. Please ensure the 'contentBlocks' collection exists and has data.");
       toast({ title: "Error", description: "Failed to load content blocks.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContentBlocks();
  }, [fetchContentBlocks]);

  const handleAddNewBlock = () => {
    setEditingBlock(null);
    setIsFormOpen(true);
  };

  const handleEditBlock = (block: ContentBlock) => {
    setEditingBlock(block);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: ContentBlockFormValues) => {
    try {
      const dataToSave = {
        ...values,
        updatedAt: serverTimestamp(),
      };

      if (editingBlock) {
        const blockRef = doc(db, "contentBlocks", editingBlock.id);
        await updateDoc(blockRef, dataToSave);
        await logAuditEvent(user, userData, 'CONTENT_BLOCK_UPDATED', 'ContentBlock', editingBlock.id, values.name, { newValues: values });
        toast({ title: "Success", description: "Content block updated successfully." });
      } else {
        const newDocRef = await addDoc(collection(db, "contentBlocks"), {
          ...dataToSave,
          createdAt: serverTimestamp(),
          version: 1, // Initial version
        });
        await logAuditEvent(user, userData, 'CONTENT_BLOCK_CREATED', 'ContentBlock', newDocRef.id, values.name, { values });
        toast({ title: "Success", description: "Content block created successfully." });
      }
      setIsFormOpen(false);
      setEditingBlock(null);
      fetchContentBlocks();
    } catch (err) {
      console.error("Error saving content block:", err);
      toast({ title: "Error", description: `Failed to save content block. ${err instanceof Error ? err.message : ''}`, variant: "destructive" });
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
     try {
      const blockRef = doc(db, "contentBlocks", blockId);
      const blockSnap = await getDoc(blockRef);
      const blockName = blockSnap.exists() ? blockSnap.data().name : blockId;

      await deleteDoc(doc(db, "contentBlocks", blockId));
      await logAuditEvent(user, userData, 'CONTENT_BLOCK_DELETED', 'ContentBlock', blockId, blockName);
      toast({ title: "Success", description: "Content block deleted successfully." });
      fetchContentBlocks();
    } catch (err) {
      console.error("Error deleting content block:", err);
      toast({ title: "Error", description: `Failed to delete content block. ${err instanceof Error ? err.message : ''}`, variant: "destructive" });
    }
  };

  const toggleBlockStatus = async (block: ContentBlock) => {
    const newStatus = block.status === "Published" ? "Draft" : "Published";
    try {
      const blockRef = doc(db, "contentBlocks", block.id);
      await updateDoc(blockRef, { status: newStatus, updatedAt: serverTimestamp() });
      await logAuditEvent(user, userData, 'CONTENT_BLOCK_STATUS_CHANGED', 'ContentBlock', block.id, block.name, { oldStatus: block.status, newStatus });
      toast({ title: "Success", description: `Block "${block.name}" status changed to ${newStatus}.` });
      fetchContentBlocks();
    } catch (err) {
      console.error("Error toggling block status:", err);
      toast({ title: "Error", description: `Failed to change status. ${err instanceof Error ? err.message : ''}`, variant: "destructive" });
    }
  };


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
            <Button onClick={handleAddNewBlock}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Block
            </Button>
          </>
        }
      />

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
            <p className="p-4 text-center text-muted-foreground">No content blocks found. Click "Add New Block" to create one.</p>
        )}
        {!loading && !error && contentBlocks.length > 0 && (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Block Name</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
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
                    <TableCell className="hidden lg:table-cell">{block.lastModified}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Block actions for {block.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions for {block.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditBlock(block)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Block
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleBlockStatus(block)}>
                                {block.status === "Published" ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                Set to {block.status === "Published" ? "Draft" : "Published"}
                            </DropdownMenuItem>
                             {/* Placeholder for future actions 
                            <DropdownMenuItem disabled>
                                <Settings className="mr-2 h-4 w-4" /> Configure Block
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Copy className="mr-2 h-4 w-4" /> Duplicate Block
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <History className="mr-2 h-4 w-4" /> View Version History
                            </DropdownMenuItem>
                            */}
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Block
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the block "{block.name}".
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteBlock(block.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
    
    <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        setIsFormOpen(isOpen);
        if (!isOpen) setEditingBlock(null);
    }}>
    <DialogContent className="sm:max-w-lg">
        <DialogHeader>
        <DialogTitle>{editingBlock ? "Edit Content Block" : "Create New Content Block"}</DialogTitle>
        <DialogDescription>
            {editingBlock ? "Make changes to your content block here." : "Fill in the details for your new content block."} Click save when you're done.
        </DialogDescription>
        </DialogHeader>
        <ContentBlockForm
            onSubmit={handleFormSubmit}
            initialData={editingBlock}
            onCancel={() => {
                setIsFormOpen(false);
                setEditingBlock(null);
            }}
        />
    </DialogContent>
    </Dialog>

    </div>
  );
}
