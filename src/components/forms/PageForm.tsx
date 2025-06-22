
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Page } from '@/app/(app)/pages/page';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ContentSchema } from './SchemaForm';
import { Checkbox } from '../ui/checkbox';


export const pageStatuses = ["Draft", "Published", "Review"] as const;
export type PageStatus = typeof pageStatuses[number];

export type PageType = string; // This is now a schema slug (string)

const pageFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9/-]+)*$/, "Slug must be lowercase alphanumeric with hyphens/slashes"),
  status: z.enum(pageStatuses),
  author: z.string().min(1, "Author is required").max(50, "Author name must be 50 characters or less"),
  pageType: z.string().min(1, "A Page Type (Schema) must be selected"),
  content: z.record(z.any()).optional().default({}),
});

export type PageFormValues = z.infer<typeof pageFormSchema>;

interface PageFormProps {
  onSubmit: (values: PageFormValues) => Promise<void>;
  initialData?: Page | null;
  onCancel: () => void;
}

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-'); 
};

// Sub-component for rendering a single field from a schema
const DynamicField = ({ fieldSchema, parentPath }: { fieldSchema: ContentSchema['fields'][number], parentPath: string }) => {
    const { control, register, formState: { errors } } = useFormContext<PageFormValues>();
    const fieldName = `${parentPath}.${fieldSchema.name}` as const;
    
    // Helper to get nested errors
    const getNestedError = (errors: any, path: string): any => {
        return path.split('.').reduce((o, k) => (o && o[k] ? o[k] : null), errors);
    };
    const error = getNestedError(errors, fieldName);


    switch (fieldSchema.type) {
        case 'text':
        case 'number':
        case 'date':
        case 'image_url':
            return (
                <div>
                    <Label htmlFor={fieldName}>{fieldSchema.label}</Label>
                    <Input id={fieldName} type={fieldSchema.type === 'image_url' ? 'text' : fieldSchema.type} {...register(fieldName)} placeholder={fieldSchema.label} />
                    {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
                </div>
            );
        case 'textarea':
        case 'rich_text': // For now, rich_text is just a textarea
            return (
                 <div>
                    <Label htmlFor={fieldName}>{fieldSchema.label}</Label>
                    <Textarea id={fieldName} {...register(fieldName)} placeholder={fieldSchema.label} rows={fieldSchema.type === 'rich_text' ? 8 : 4} />
                    {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
                </div>
            );
        case 'boolean':
            return (
                 <div className="flex items-center space-x-2 pt-4">
                    <Controller
                        name={fieldName}
                        control={control}
                        render={({ field }) => (
                            <Checkbox id={fieldName} checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor={fieldName}>{fieldSchema.label}</Label>
                    {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
                </div>
            );
        case 'repeater':
            return <RepeaterField fieldSchema={fieldSchema} parentPath={parentPath} />;

        default:
            return <p>Unsupported field type: {fieldSchema.type}</p>;
    }
}

// Sub-component for rendering a repeater field (useFieldArray)
const RepeaterField = ({ fieldSchema, parentPath }: { fieldSchema: ContentSchema['fields'][number], parentPath: string }) => {
    const { control, formState: { errors } } = useFormContext<PageFormValues>();
    const fieldName = `${parentPath}.${fieldSchema.name}` as const;
    const { fields, append, remove } = useFieldArray({
        control,
        name: fieldName
    });
    
    // Helper to get nested errors
    const getNestedError = (errors: any, path: string): any => {
        return path.split('.').reduce((o, k) => (o && o[k] ? o[k] : null), errors);
    };

    return (
        <Card className="my-4 border-dashed">
            <CardHeader>
                <CardTitle className="text-md">{fieldSchema.label}</CardTitle>
                <CardDescription>Add, remove, or reorder items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {fields.map((item, index) => {
                     const itemError = getNestedError(errors, `${fieldName}[${index}]`);
                     return (
                        <Card key={item.id} className="p-3 bg-muted/50 relative">
                             <div className="space-y-2">
                                <Label>Item {index + 1}</Label>
                                <Textarea {...control.register(`${fieldName}.${index}.value` as const)} placeholder={`Enter value for item ${index + 1}`} />
                                {itemError && <p className="text-sm text-destructive mt-1">{itemError.value?.message}</p>}
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute top-1 right-1 h-6 w-6 text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </Card>
                    )
                })}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </CardContent>
        </Card>
    )
}


export function PageForm({ onSubmit, initialData, onCancel }: PageFormProps) {
  const { toast } = useToast();
  const { user, userData } = useAuth(); 
  
  const [schemas, setSchemas] = useState<ContentSchema[]>([]);
  const [isLoadingSchemas, setIsLoadingSchemas] = useState(true);
  const [activeSchema, setActiveSchema] = useState<ContentSchema | null>(null);

  const methods = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'Draft',
      author: initialData?.author || userData?.name || user?.email || 'Admin', 
      pageType: initialData?.pageType || '',
      content: initialData?.content || {},
    },
  });
  
  const { control, formState: { errors, isSubmitting }, handleSubmit, register, setValue, watch, setError, clearErrors } = methods;
  
  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedPageType = watch("pageType");

  useEffect(() => {
    async function fetchSchemas() {
        setIsLoadingSchemas(true);
        try {
            const schemasQuery = query(collection(db, "contentSchemas"));
            const querySnapshot = await getDocs(schemasQuery);
            const fetchedSchemas = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ContentSchema));
            setSchemas(fetchedSchemas);
        } catch (error) {
            console.error("Error fetching schemas for form:", error);
            toast({ title: "Error", description: "Could not load page types (schemas).", variant: "destructive" });
        } finally {
            setIsLoadingSchemas(false);
        }
    }
    fetchSchemas();
  }, [toast]);

  useEffect(() => {
    if (watchedTitle && !initialData?.slug) {
      setValue("slug", generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, initialData]);

  const checkSlugUniqueness = useCallback(
    async (slugToCheck: string) => {
      if (!slugToCheck) return;
      if (initialData && initialData.slug === slugToCheck) {
        clearErrors("slug");
        return;
      }
      try {
        const q = query(collection(db, "pages"), where("slug", "==", slugToCheck), where("__name__", "!=", initialData?.id || ""));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            setError("slug", { type: "manual", message: "This slug is already in use." });
        } else {
           clearErrors("slug"); 
        }
      } catch (error) {
        console.error("Error checking slug uniqueness:", error);
        toast({ title: "Error", description: "Could not verify slug uniqueness.", variant: "destructive" });
      }
    },
    [initialData, setError, clearErrors, toast]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (watchedSlug) checkSlugUniqueness(watchedSlug);
    }, 500);
    return () => clearTimeout(handler);
  }, [watchedSlug, checkSlugUniqueness]);

  useEffect(() => {
    const schema = schemas.find(s => s.slug === watchedPageType);
    setActiveSchema(schema || null);
  }, [watchedPageType, schemas]);


  return (
    <FormProvider {...methods}>
      <ScrollArea className="h-[70vh] sm:h-auto sm:max-h-[80vh] pr-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Card>
            <CardHeader>
                <CardTitle>Page Metadata</CardTitle>
                <CardDescription>Core details for page identification and management.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" {...register("title")} placeholder="Enter page title" />
                    {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" {...register("slug")} placeholder="e.g., my-awesome-page" />
                    {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
                </div>
                <div>
                    <Label htmlFor="pageType">Page Type (Schema)</Label>
                    <Controller
                    name="pageType"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingSchemas}>
                        <SelectTrigger id="pageType">
                            <SelectValue placeholder={isLoadingSchemas ? "Loading schemas..." : "Select a page type"} />
                        </SelectTrigger>
                        <SelectContent>
                            {schemas.map(schema => (
                            <SelectItem key={schema.id} value={schema.slug}>{schema.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                    />
                    {errors.pageType && <p className="text-sm text-destructive mt-1">{errors.pageType.message}</p>}
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {pageStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                    />
                </div>
                 <div>
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" {...register("author")} placeholder="Author's name" />
                    {errors.author && <p className="text-sm text-destructive mt-1">{errors.author.message}</p>}
                </div>
            </CardContent>
          </Card>

          {activeSchema && (
            <Card>
                <CardHeader>
                    <CardTitle>Page Content</CardTitle>
                    <CardDescription>Content fields defined by the "{activeSchema.name}" schema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeSchema.fields.map(field => (
                        <DynamicField key={field.id} fieldSchema={field} parentPath="content" />
                    ))}
                </CardContent>
            </Card>
          )}

          {!activeSchema && watchedPageType && !isLoadingSchemas && (
             <Card>
                <CardHeader><CardTitle className="text-destructive">Schema Not Found</CardTitle></CardHeader>
                <CardContent>
                    <p>The selected page type "{watchedPageType}" does not correspond to a valid schema. Please select a different type or create a new schema.</p>
                </CardContent>
             </Card>
          )}
          
          <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background pb-4 border-t z-10">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !!errors.slug || !activeSchema}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Page')}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </FormProvider>
  );
}
