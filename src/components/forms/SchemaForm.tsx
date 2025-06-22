
"use client";

import React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

// Define the structure of a single field within a schema
export const fieldSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1, 'Field name is required').regex(/^[a-zA-Z0-9_]+$/, 'Name must be alphanumeric with underscores'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['text', 'textarea', 'number', 'boolean', 'date', 'image_url', 'rich_text']),
  required: z.boolean().default(false),
});
export type SchemaField = z.infer<typeof fieldSchema>;


// Define the structure for the entire schema form
export const contentSchemaFormSchema = z.object({
  name: z.string().min(1, "Schema Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase and contain only letters, numbers, and hyphens"),
  description: z.string().optional(),
  fields: z.array(fieldSchema).default([]),
});
export type ContentSchemaFormValues = z.infer<typeof contentSchemaFormSchema>;

// This is the type for data fetched from Firestore, including the ID
export interface ContentSchema extends ContentSchemaFormValues {
  id: string;
}

interface SchemaFormProps {
  onSubmit: (values: ContentSchemaFormValues) => Promise<void>;
  initialData?: ContentSchema | null;
  onCancel: () => void;
}

export function SchemaForm({ onSubmit, initialData, onCancel }: SchemaFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ContentSchemaFormValues>({
    resolver: zodResolver(contentSchemaFormSchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      description: '',
      fields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Schema Name</Label>
                    <Input id="name" {...register("name")} placeholder="e.g., Blog Post, Product, Event" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <Label htmlFor="slug">Schema Slug (Collection Name)</Label>
                    <Input id="slug" {...register("slug")} placeholder="e.g., blog-posts, products (lowercase, hyphens)" disabled={!!initialData} />
                    {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
                    {!!initialData && <p className="text-xs text-muted-foreground mt-1">Slug cannot be changed after creation.</p>}
                </div>
                <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" {...register("description")} placeholder="Briefly describe what this content type is for." />
                    {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex justify-between items-center">
                            Fields
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ id: crypto.randomUUID(), name: '', label: '', type: 'text', required: false })}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Add Field
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {fields.length === 0 && (
                            <div className="text-center text-muted-foreground py-4">No fields added yet.</div>
                        )}
                        {fields.map((field, index) => (
                            <Card key={field.id} className="p-4 bg-muted/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor={`fields.${index}.name`}>Field Name</Label>
                                        <Input {...register(`fields.${index}.name`)} placeholder="e.g., post_title" />
                                        {errors.fields?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.fields[index]?.name?.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor={`fields.${index}.label`}>Field Label</Label>
                                        <Input {...register(`fields.${index}.label`)} placeholder="e.g., Post Title" />
                                        {errors.fields?.[index]?.label && <p className="text-sm text-destructive mt-1">{errors.fields[index]?.label?.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor={`fields.${index}.type`}>Field Type</Label>
                                        <Controller
                                            name={`fields.${index}.type`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Text</SelectItem>
                                                        <SelectItem value="textarea">Textarea</SelectItem>
                                                        <SelectItem value="number">Number</SelectItem>
                                                        <SelectItem value="boolean">Boolean (Checkbox)</SelectItem>
                                                        <SelectItem value="date">Date</SelectItem>
                                                        <SelectItem value="image_url">Image URL</SelectItem>
                                                        <SelectItem value="rich_text">Rich Text</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-center gap-2 pt-6">
                                            <Controller
                                                name={`fields.${index}.required`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id={`fields.${index}.required`}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor={`fields.${index}.required`} className="font-normal">Required</Label>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>
      </ScrollArea>
      <div className="flex justify-end gap-2 pt-4 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Schema')}
        </Button>
      </div>
    </form>
  );
}
