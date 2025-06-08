
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Page } from '@/app/(app)/pages/page'; // Import Page type
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch, setError, clearErrors } = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'Draft',
      author: initialData?.author || 'Admin', // Consider fetching current user as default
    },
  });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (watchedTitle && !initialData?.slug && !initialData?.title) { // Only auto-generate slug for new pages if title is typed first
      setValue("slug", generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, initialData]);

  // Debounced slug check
  const checkSlugUniqueness = useCallback(
    async (slugToCheck: string) => {
      if (!slugToCheck) return;
      if (initialData && initialData.slug === slugToCheck) {
        clearErrors("slug");
        setSlugCustomError(null);
        return; // Slug hasn't changed from initial data during edit
      }

      setIsCheckingSlug(true);
      setSlugCustomError(null);
      clearErrors("slug");

      try {
        const q = query(collection(db, "pages"), where("slug", "==", slugToCheck));
        const querySnapshot = await getDocs(q);
        
        let slugIsTaken = false;
        if (!querySnapshot.empty) {
          // If editing, check if the found slug belongs to the current page
          if (initialData) {
            querySnapshot.forEach(doc => {
              if (doc.id !== initialData.id) {
                slugIsTaken = true;
              }
            });
          } else {
            // If creating, any match means it's taken
            slugIsTaken = true;
          }
        }

        if (slugIsTaken) {
          setError("slug", { type: "manual", message: "This slug is already in use. Please choose another." });
          setSlugCustomError("This slug is already in use. Please choose another.");
        } else {
           clearErrors("slug"); // Clear schema validation if custom is ok
           setSlugCustomError(null);
        }
      } catch (error) {
        console.error("Error checking slug uniqueness:", error);
        toast({
          title: "Error",
          description: "Could not verify slug uniqueness. Please try again.",
          variant: "destructive",
        });
        // Optionally set an error state here
      } finally {
        setIsCheckingSlug(false);
      }
    },
    [initialData, setError, clearErrors, toast]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (watchedSlug && (pageFormSchema.shape.slug.safeParse(watchedSlug).success)) { // Only check if basic format is valid
         checkSlugUniqueness(watchedSlug);
      }
    }, 500); // Debounce time: 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [watchedSlug, checkSlugUniqueness]);


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
        {!errors.slug && slugError && <p className="text-sm text-destructive mt-1">{slugError}</p>}
        {isCheckingSlug && <p className="text-sm text-muted-foreground mt-1">Checking slug availability...</p>}
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isCheckingSlug}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isCheckingSlug || !!slugError || !!errors.slug}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Page')}
        </Button>
      </div>
    </form>
  );
}
