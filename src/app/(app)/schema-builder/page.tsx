
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, List, Edit, Trash2, AlertTriangle, Loader2, Database as DatabaseIcon } from "lucide-react"; // Added DatabaseIcon
import React, { useState, useEffect } from 'react';
// import { db } from '@/lib/firebase'; // Would be needed for actual implementation
// import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


// Placeholder types - actual implementation would be more complex
interface SchemaField {
  id: string; // unique within the schema
  name: string; // machine-readable name, e.g., "post_title"
  label: string; // human-readable label, e.g., "Post Title"
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'image_url' | 'select' | 'rich_text' | 'group'; // Added rich_text and group
  options?: string[]; // For select type
  required?: boolean;
  // For 'group' type, fields would be nested SchemaField[]
  fields?: SchemaField[]; 
}

interface ContentSchema {
  id: string; // Firestore doc ID
  name: string; // e.g., "Blog Post", "Product" - User-friendly name for the schema
  slug: string; // e.g., "blog-posts", "products" - used for collection name or identifier, must be unique
  description?: string;
  fields: SchemaField[];
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
}

export default function SchemaBuilderPage() {
  const [schemas, setSchemas] = useState<ContentSchema[]>([]);
  const [loading, setLoading] = useState(false); // Set to false initially, true when actually fetching
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState<ContentSchema | null>(null);
  const { toast } = useToast();

  // useEffect(() => {
  //   const fetchSchemas = async () => {
  //     setLoading(true);
  //     try {
  //       // const querySnapshot = await getDocs(collection(db, "_contentSchemas")); // Example collection name
  //       // const fetchedSchemas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentSchema));
  //       // setSchemas(fetchedSchemas);
  //       setSchemas([]); // Simulate empty for now
  //     } catch (error) {
  //       console.error("Error fetching schemas:", error);
  //       toast({ title: "Error", description: "Could not load schemas.", variant: "destructive" });
  //     }
  //     setLoading(false);
  //   };
  //   // fetchSchemas(); // Commented out until backend is ready
  // }, [toast]);

  const handleCreateNewSchema = () => {
    setEditingSchema(null);
    // setIsFormOpen(true); // This would open a form dialog/modal for schema definition
    toast({ title: "Feature Pending", description: "Schema creation form and logic are not yet implemented."});
  };

  const handleEditSchema = (schema: ContentSchema) => {
    // Placeholder: In a real app, check if content exists for this schema.
    const dataExistsForThisSchema = false; // This would be a real check, e.g., count documents in collection `schema.slug`
    
    if (dataExistsForThisSchema) {
        toast({
            title: "Editing Restricted",
            description: `Schema "${schema.name}" has existing content. Modifying its structure directly is restricted to prevent data loss. Advanced editing with data migration is a complex feature planned for future updates.`,
            variant: "destructive",
            duration: 10000
        });
        return;
    }
    setEditingSchema(schema);
    // setIsFormOpen(true); // Would open a form dialog/modal
    toast({ title: "Feature Pending", description: `Editing functionality for "${schema.name}" is not yet implemented.`});
  };

  const handleDeleteSchema = async (schema: ContentSchema) => {
    // Placeholder: In a real app, check if content exists.
    const dataExistsForThisSchema = false; // Real check needed
    if (dataExistsForThisSchema) {
        toast({
            title: "Deletion Restricted",
            description: `Schema "${schema.name}" cannot be deleted because it has existing content. Please remove all content using this schema first, or use an archive function (if available).`,
            variant: "destructive",
            duration: 10000
        });
        return;
    }
    // Placeholder deletion logic
    toast({ title: "Feature Pending", description: `Deletion for "${schema.name}" not yet implemented.`});
    // Example:
    // setSchemas(prev => prev.filter(s => s.id !== schemaId));
    // try {
    //   // await deleteDoc(doc(db, "_contentSchemas", schemaId));
    //   toast({ title: "Schema Deleted (Simulated)", description: `Schema "${schema.name}" has been removed.` });
    // } catch (error) {
    //   console.error("Error deleting schema:", error);
    //   toast({ title: "Error", description: "Could not delete schema.", variant: "destructive" });
    // }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Schema Builder"
        description="Define and manage the structure of your content types (sections)."
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
            Manage the data structures for your content. Each schema defines a content type (e.g., "Blog Posts", "Products", "Events").
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
                Get started by creating your first content schema. This will define the structure for a new type of content in your CMS.
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
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 hover:border-destructive/50" onClick={() => handleDeleteSchema(schema)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          <Card className="mt-8 bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700">
            <CardHeader className="flex flex-row items-start space-x-3 space-y-0 pb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                <div>
                    <CardTitle className="text-amber-700 dark:text-amber-300 text-base">Important Considerations for Schema Management</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="text-xs text-amber-700 dark:text-amber-400 pt-0">
                <ul className="list-disc space-y-1 pl-5">
                    <li>
                        <strong>Planning is Key:</strong> Before creating schemas, plan your content structures carefully. Think about the types of information you need to store.
                    </li>
                    <li>
                        <strong>Slug Uniqueness:</strong> The 'slug' for each schema (e.g., "blog-posts") will likely be used as the Firestore collection name. It must be unique and should not be changed after creation if content exists.
                    </li>
                    <li>
                        <strong>Editing Schemas:</strong>
                        <ul className="list-circle pl-4 mt-1 space-y-0.5">
                            <li>Adding new fields to an existing schema is generally safe.</li>
                            <li>Modifying (e.g., changing type) or deleting fields from a schema that already has content is risky and can lead to data loss or application errors if not managed with data migration strategies.</li>
                        </ul>
                    </li>
                     <li>
                        <strong>Data Relationships:</strong> This basic schema builder doesn't explicitly handle complex relationships (e.g., one-to-many, many-to-many) between different content types. You would manage these through reference fields or by convention.
                    </li>
                    <li>
                        <strong>Iterative Development:</strong> This Schema Builder is a foundational component. Full dynamic form generation, advanced validation, and data migration tools are complex features that would be built upon this.
                    </li>
                </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      
      {/* Dialog for Creating/Editing Schema (Non-functional placeholder for UI structure) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl"> {/* Made wider for schema editing */}
          <DialogHeader>
            <DialogTitle>{editingSchema ? `Edit Schema: ${editingSchema.name}` : "Create New Content Schema"}</DialogTitle>
            <DialogDescription>
              {editingSchema ? "Modify the details of your content schema." : "Define a new structure for a content type."}
              Make sure the slug is unique and reflects where content will be stored.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Placeholder for actual form fields */}
            <div>
                <Label htmlFor="schemaName">Schema Name</Label>
                <Input id="schemaName" placeholder="e.g., Blog Post, Product, Event" defaultValue={editingSchema?.name}/>
            </div>
            <div>
                <Label htmlFor="schemaSlug">Schema Slug (Collection Name)</Label>
                <Input id="schemaSlug" placeholder="e.g., blog-posts, products (lowercase, hyphens)" defaultValue={editingSchema?.slug} disabled={!!editingSchema && true /* Disable slug editing if content might exist */} />
                 {editingSchema && <p className="text-xs text-muted-foreground mt-1">Slug cannot be changed after creation if content exists.</p>}
            </div>
             <div>
                <Label htmlFor="schemaDescription">Description (Optional)</Label>
                <Textarea id="schemaDescription" placeholder="Briefly describe what this content type is for." defaultValue={editingSchema?.description}/>
            </div>
            
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Fields</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Field definition UI (add, remove, reorder, configure type, label, etc.) would go here.</p>
                    <div className="mt-2 p-4 border border-dashed rounded-md min-h-[100px] flex items-center justify-center">
                        <span className="text-muted-foreground">Dynamic Field Builder Area (Not Implemented)</span>
                    </div>
                </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={() => { setIsFormOpen(false); toast({title: "Save (Not Implemented)", description: "Saving schema functionality is pending."})}}>
                {editingSchema ? "Save Changes" : "Create Schema"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

