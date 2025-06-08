
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Page } from '@/app/(app)/pages/page'; // Import Page type

export const pageStatuses = ["Draft", "Published", "Review"] as const;
export type PageStatus = typeof pageStatuses[number];

const pageFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  status: z.enum(pageStatuses),
  author: z.string().min(1, "Author is required").max(50, "Author name must be 50 characters or less"),
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
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

export function PageForm({ onSubmit, initialData, onCancel }: PageFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch } = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'Draft',
      author: initialData?.author || 'Admin',
    },
  });

  const watchedTitle = watch("title");
  React.useEffect(() => {
    if (watchedTitle && !initialData?.slug) { // Only auto-generate slug for new pages or if slug was empty
      setValue("slug", generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, initialData?.slug]);


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Enter page title" />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} placeholder="e.g., my-awesome-page" />
        {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">The unique URL path for this page.</p>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {pageStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="author">Author</Label>
        <Input id="author" {...register("author")} placeholder="Author's name" />
        {errors.author && <p className="text-sm text-destructive mt-1">{errors.author.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Page')}
        </Button>
      </div>
    </form>
  );
}

    