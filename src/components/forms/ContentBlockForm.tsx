
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ContentBlock } from '@/app/(app)/content-blocks/page';

export const contentBlockStatuses = ["Draft", "Published", "Archived"] as const;
export type ContentBlockStatus = typeof contentBlockStatuses[number];

export const contentBlockTypes = ["Generic", "HeroText", "FooterContent", "CallToAction", "Testimonial"] as const;
export type ContentBlockType = typeof contentBlockTypes[number];

const contentBlockFormSchema = z.object({
  name: z.string().min(1, "Block name is required").max(100, "Name must be 100 characters or less"),
  type: z.enum(contentBlockTypes),
  status: z.enum(contentBlockStatuses),
  content: z.string().min(1, "Content is required"), // Simple text content for now
});

export type ContentBlockFormValues = z.infer<typeof contentBlockFormSchema>;

interface ContentBlockFormProps {
  onSubmit: (values: ContentBlockFormValues) => Promise<void>;
  initialData?: ContentBlock | null;
  onCancel: () => void;
}

export function ContentBlockForm({ onSubmit, initialData, onCancel }: ContentBlockFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ContentBlockFormValues>({
    resolver: zodResolver(contentBlockFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'Generic',
      status: initialData?.status || 'Draft',
      content: initialData?.content || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div>
        <Label htmlFor="name">Block Name</Label>
        <Input id="name" {...register("name")} placeholder="Enter a descriptive name for the block" />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="type">Block Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select block type" />
              </SelectTrigger>
              <SelectContent>
                {contentBlockTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
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
                {contentBlockStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="Enter the content for this block..."
          rows={6}
        />
        {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          For now, this is plain text. Rich text or structured content can be added later.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Block')}
        </Button>
      </div>
    </form>
  );
}
