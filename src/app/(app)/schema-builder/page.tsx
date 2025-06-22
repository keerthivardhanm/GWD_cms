
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, List, Edit, Trash2, AlertTriangle, Loader2, Database as DatabaseIcon } from "lucide-react";
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SchemaForm, type ContentSchema, type ContentSchemaFormValues } from '@/components/forms/SchemaForm';

export default function SchemaBuilderPage() {
  const [schemas, setSchemas] = useState<ContentSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState<ContentSchema | null>(null);
  const { toast } = useToast();
  const { user, userData } = useAuth();
  
  const [contentExistsMap, setContentExistsMap] = useState<Record<string, boolean>>({});

  const checkContentExists = useCallback(async (schemaSlug: string) => {
    if (!schemaSlug) return false;
    try {
      const pagesQuery = query(collection(db, 'pages'), where('pageType', '==', schemaSlug), limit(1));
      const querySnapshot = await getDocs(pagesQuery);
      return !querySnapshot.empty;
    } catch (error) {
      console.error(`Error checking content for schema ${schemaSlug}:`, error);
      return false;
    }
  }, []);

  const fetchSchemas = useCallback(async () => {
    setLoading(true);
    try {
        const schemasQuery = query(collection(db, "contentSchemas"), where("name", "!=", "")); // Basic query to get schemas
        const querySnapshot = await getDocs(schemasQuery);
        const fetchedSchemas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ContentSchema));
        
        setSchemas(fetchedSchemas);

        const checks = fetchedSchemas.map(schema => checkContentExists(schema.slug));
        const results = await Promise.all(checks);
        
        const newContentExistsMap: Record<string, boolean> = {};
        fetchedSchemas.forEach((schema, index) => {
            newContentExistsMap[schema.slug] = results[index];
        });
        setContentExistsMap(newContentExistsMap);

    } catch (error) {
        console.error("Error fetching schemas:", error);
        toast({ title: "Error", description: "Could not fetch content schemas.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [checkContentExists, toast]);
  
  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  const handleCreateNewSchema = () => {
    setEditingSchema(null);
    setIsFormOpen(true);
  };

  const handleEditSchema = (schema: ContentSchema) => {
    setEditingSchema(schema);
    setIsFormOpen(true);
  };
  
  const handleSaveSchema = async (values: ContentSchemaFormValues) => {
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to save a schema.", variant: "destructive"});
        return;
    }
    try {
        if (editingSchema) {
            const schemaRef = doc(db, "contentSchemas", editingSchema.id);
            await updateDoc(schemaRef, { ...values, updatedAt: serverTimestamp() });
            toast({ title: "Schema Updated", description: `"${values.name}" has been updated successfully.` });
        } else {
            await addDoc(collection(db, "contentSchemas"), { ...values, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
            toast({ title: "Schema Created", description: `"${values.name}" has been created successfully.` });
        }
        setIsFormOpen(false);
        setEditingSchema(null);
        fetchSchemas(); // Re-fetch to show changes
    } catch (error) {
        console.error("Error saving schema: ", error);
        toast({ title: "Error", description: "Failed to save schema.", variant: "destructive" });
    }
  };

  const handleDeleteSchema = async (schemaId: string, schemaName: string) => {
    try {
        await deleteDoc(doc(db, "contentSchemas", schemaId));
        toast({ title: "Schema Deleted", description: `"${schemaName}" has been deleted.` });
        fetchSchemas(); // Re-fetch
    } catch (error) {
        console.error("Error deleting schema: ", error);
        toast({ title: "Error", description: "Failed to delete schema.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schema Builder"
        description="Define and manage the structure of your content types."
        actions={
          <Button onClick={handleCreateNewSchema}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Schema
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DatabaseIcon className="h-5 w-5"/> Content Schemas</CardTitle>
          <CardDescription>
            Manage data structures for your content. Each schema defines a content type (e.g., "Blog Posts").
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading schemas...</p>
            </div>
          ) : schemas.length === 0 ? (
            <div className="text-center py-10">
              <List className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Schemas Defined</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first content schema.
              </p>
              <Button onClick={handleCreateNewSchema}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create First Schema
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schemas.map((schema) => {
                const hasContent = contentExistsMap[schema.slug] || false;
                return (
                    <Card key={schema.id} className="flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="truncate" title={schema.name}>{schema.name}</span>
                            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            /{schema.slug}
                            </span>
                        </CardTitle>
                        <CardDescription className="h-10 text-xs overflow-hidden text-ellipsis">
                            {schema.description || "No description provided."}
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Fields ({schema.fields.length}):</p>
                        {schema.fields.length > 0 ? (
                            <div className="max-h-24 overflow-y-auto text-xs space-y-0.5 pr-2">
                            {schema.fields.slice(0, 5).map(field => (
                                <div key={field.id} className="flex justify-between items-center bg-muted/50 p-1 rounded-sm">
                                <span className="truncate" title={field.label || field.name}>{field.label || field.name}</span>
                                <span className="text-muted-foreground capitalize text-[10px] bg-background px-1.5 py-0.5 rounded-sm">{field.type.replace('_', ' ')}</span>
                                </div>
                            ))}
                            {schema.fields.length > 5 && <p className="text-center text-muted-foreground text-[10px] pt-1">...and {schema.fields.length - 5} more fields.</p>}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">No fields defined for this schema.</p>
                        )}
                        </CardContent>
                        <div className="border-t p-3 flex justify-end gap-2 bg-muted/30 rounded-b-lg">
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={0}>
                                <Button variant="outline" size="sm" onClick={() => handleEditSchema(schema)} disabled={hasContent}>
                                    <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                                </Button>
                                </span>
                            </TooltipTrigger>
                            {hasContent && (
                                <TooltipContent>
                                <p>Cannot edit a schema that has existing content.</p>
                                </TooltipContent>
                            )}
                            </Tooltip>
                        </TooltipProvider>
                        <AlertDialog>
                            <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <span tabIndex={0}>
                                    <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 hover:border-destructive/50" disabled={hasContent}>
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                                    </Button>
                                    </AlertDialogTrigger>
                                </span>
                                </TooltipTrigger>
                                {hasContent && (
                                <TooltipContent>
                                    <p>Cannot delete a schema that has existing content.</p>
                                </TooltipContent>
                                )}
                            </Tooltip>
                            </TooltipProvider>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete "{schema.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone and will permanently delete the "{schema.name}" schema definition.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteSchema(schema.id, schema.name)}>
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    </Card>
                )
              })}
            </div>
          )}
          
          <Card className="mt-8 bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700">
            <CardHeader className="flex flex-row items-start space-x-3 space-y-0 pb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                <div>
                    <CardTitle className="text-amber-700 dark:text-amber-300 text-base">Important Considerations</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="text-xs text-amber-700 dark:text-amber-400 pt-0">
                <ul className="list-disc space-y-1 pl-5">
                    <li>
                        <strong>Dynamic Forms:</strong> Creating a schema here does not automatically create a page form. Full dynamic form generation based on these schemas is the next major step. For now, schemas for existing page types are hardcoded for stability.
                    </li>
                    <li>
                        <strong>Slug Uniqueness:</strong> The 'slug' for each schema must be unique and should not be changed after content has been created using it.
                    </li>
                    <li>
                        <strong>Editing Schemas with Content:</strong> Modifying or deleting fields from a schema that is already in use by pages can lead to data loss. This feature is disabled for schemas with existing content to prevent errors.
                    </li>
                </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingSchema(null);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSchema ? `Edit Schema: ${editingSchema.name}` : "Create New Content Schema"}</DialogTitle>
            <DialogDescription>
              {editingSchema ? "Modify the details of your content schema." : "Define a new structure for a content type."}
              Make sure the slug is unique.
            </DialogDescription>
          </DialogHeader>
          <SchemaForm
            key={editingSchema ? editingSchema.id : 'new-schema'}
            onSubmit={handleSaveSchema}
            initialData={editingSchema}
            onCancel={() => {
                setIsFormOpen(false);
                setEditingSchema(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
