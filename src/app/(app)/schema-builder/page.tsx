
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, List, Edit, Trash2, AlertTriangle, Loader2, Database as DatabaseIcon } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


// Placeholder types - actual implementation would be more complex
interface SchemaField {
  id: string;
  name: string;
  label: string; 
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'image_url' | 'select' | 'rich_text' | 'group'; 
  options?: string[];
  required?: boolean;
  fields?: SchemaField[]; 
}

interface ContentSchema {
  id: string; 
  name: string; 
  slug: string; 
  description?: string;
  fields: SchemaField[];
  createdAt?: any; 
  updatedAt?: any; 
}

const initialExampleSchemas: ContentSchema[] = [
    {
        id: "1",
        name: "Blog Post",
        slug: "blog-posts",
        description: "Standard schema for creating blog articles.",
        fields: [
            { id: "f1", name: "title", label: "Title", type: "text", required: true },
            { id: "f2", name: "featured_image", label: "Featured Image", type: "image_url", required: true },
            { id: "f3", name: "content", label: "Content", type: "rich_text", required: true },
            { id: "f4", name: "author", label: "Author", type: "text", required: false },
        ]
    },
    {
        id: "2",
        name: "Service Page",
        slug: "service-pages",
        description: "Schema for individual company service offerings.",
        fields: [
            { id: "s1", name: "service_name", label: "Service Name", type: "text", required: true },
            { id: "s2", name: "description", label: "Description", type: "textarea", required: true },
            { id: "s3", name: "service_icon", label: "Service Icon URL", type: "image_url", required: false },
        ]
    }
];

export default function SchemaBuilderPage() {
  const [schemas, setSchemas] = useState<ContentSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState<ContentSchema | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching schemas from a source
    setTimeout(() => {
      setSchemas(initialExampleSchemas);
      setLoading(false);
    }, 500);
  }, []);

  const handleCreateNewSchema = () => {
    setEditingSchema(null);
    setIsFormOpen(true);
  };

  const handleEditSchema = (schema: ContentSchema) => {
    const dataExistsForThisSchema = false; // This would be a real check against Firestore
    
    if (dataExistsForThisSchema) {
        toast({
            title: "Editing Restricted",
            description: `Schema "${schema.name}" has existing content. Modifying its structure is restricted to prevent data loss.`,
            variant: "destructive",
            duration: 10000
        });
        return;
    }
    setEditingSchema(schema);
    setIsFormOpen(true);
  };
  
  const handleSaveSchema = () => {
      // In a real implementation, this would save to Firestore
      toast({title: "Save (Not Implemented)", description: "Saving schema functionality is pending. This is a UI demonstration."});
      setIsFormOpen(false);
  }

  const handleDeleteSchema = (schema: ContentSchema) => {
    const dataExistsForThisSchema = false; // Real check needed
    if (dataExistsForThisSchema) {
        toast({
            title: "Deletion Restricted",
            description: `Schema "${schema.name}" cannot be deleted because it has existing content.`,
            variant: "destructive",
            duration: 10000
        });
        return;
    }
    toast({ title: "Delete (Not Implemented)", description: `Deletion for "${schema.name}" not yet implemented.`});
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
              {schemas.map((schema) => (
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
                    <Button variant="outline" size="sm" onClick={() => handleEditSchema(schema)}>
                      <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 hover:border-destructive/50">
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete "{schema.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. Deleting a schema with existing content can lead to data loss. This is a UI demonstration.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteSchema(schema)}>
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
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
                        <strong>Dynamic Forms:</strong> Creating a schema here does not automatically create a page form. Full dynamic form generation based on these schemas is the next major step.
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
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSchema ? `Edit Schema: ${editingSchema.name}` : "Create New Content Schema"}</DialogTitle>
            <DialogDescription>
              {editingSchema ? "Modify the details of your content schema." : "Define a new structure for a content type."}
              Make sure the slug is unique.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <Label htmlFor="schemaName">Schema Name</Label>
                <Input id="schemaName" placeholder="e.g., Blog Post, Product, Event" defaultValue={editingSchema?.name}/>
            </div>
            <div>
                <Label htmlFor="schemaSlug">Schema Slug (Collection Name)</Label>
                <Input id="schemaSlug" placeholder="e.g., blog-posts, products (lowercase, hyphens)" defaultValue={editingSchema?.slug} disabled={!!editingSchema} />
                 {editingSchema && <p className="text-xs text-muted-foreground mt-1">Slug cannot be changed after creation.</p>}
            </div>
             <div>
                <Label htmlFor="schemaDescription">Description (Optional)</Label>
                <Textarea id="schemaDescription" placeholder="Briefly describe what this content type is for." defaultValue={editingSchema?.description}/>
            </div>
            
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Fields</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">This is where you would add, remove, and configure fields for your schema (e.g., text fields, image uploads, repeaters).</p>
                    <div className="mt-2 p-4 border border-dashed rounded-md min-h-[100px] flex items-center justify-center">
                        <span className="text-muted-foreground font-medium">Dynamic Field Builder (Future Implementation)</span>
                    </div>
                </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSchema}>
                {editingSchema ? "Save Changes" : "Create Schema"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
