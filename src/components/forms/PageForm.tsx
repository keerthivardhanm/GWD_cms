
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Page, HomePage, AboutUsPage } from '@/app/(app)/pages/page'; // Import Page types
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { HomePageContentSchema, HomePageContentType } from '@/schemas/pages/homePageSchema';
import { AboutUsPageContentSchema, AboutUsPageContentType } from '@/schemas/pages/aboutUsPageSchema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';

export const pageStatuses = ["Draft", "Published", "Review"] as const;
export type PageStatus = typeof pageStatuses[number];

export const pageTypes = ["generic", "home", "about-us", "admissions", "programs", "program-detail", "centres", "centre-detail", "contact", "enquiry"] as const;
export type PageType = typeof pageTypes[number];


// Base schema for common page fields
const basePageFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9/-]+)*$/, "Slug must be lowercase alphanumeric with hyphens/slashes"),
  status: z.enum(pageStatuses),
  author: z.string().min(1, "Author is required").max(50, "Author name must be 50 characters or less"),
  pageType: z.enum(pageTypes).default('generic'),
});

// Combined schema for validation, actual content structure is handled separately
const pageFormValidationSchema = basePageFormSchema.extend({
  // For HomePage content - only validate a few representative fields for form structure example
  homeHeroHeading: z.string().optional(),
  homeWhyChooseIntroHeading: z.string().optional(),
  // Add more specific fields for other page types if needed for direct form validation
});


export type PageFormValues = z.infer<typeof basePageFormSchema>; // Base values for the form
                                                               // Content will be handled separately

interface PageFormProps {
  onSubmit: (values: PageFormValues, pageType: PageType, content?: any) => Promise<void>;
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

export function PageForm({ onSubmit, initialData, onCancel }: PageFormProps) {
  const { toast } = useToast();
  
  const [currentContentType, setCurrentContentType] = useState<PageType>(initialData?.pageType || 'generic');

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch, setError, clearErrors, reset } = useForm<z.infer<typeof pageFormValidationSchema>>({
    resolver: zodResolver(pageFormValidationSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'Draft',
      author: initialData?.author || 'Admin',
      pageType: initialData?.pageType || 'generic',
      // Initialize specific fields for 'home' pageType if editing
      homeHeroHeading: initialData?.pageType === 'home' ? (initialData as HomePage).content?.heroSection?.slides?.[0]?.heading || '' : '',
      homeWhyChooseIntroHeading: initialData?.pageType === 'home' ? (initialData as HomePage).content?.whyChoose?.introHeading || '' : '',
    },
  });
  
  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedPageType = watch("pageType");

  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugCustomError] = useState<string | null>(null);

  // For managing Hero Slides for Home Page
  const { fields: heroSlidesFields, append: appendHeroSlide, remove: removeHeroSlide } = useFieldArray({
    control,
    name: "content.heroSection.slides" as any, // Adjust name to match nested structure
  });


  useEffect(() => {
     setCurrentContentType(watchedPageType);
     // Reset form with potentially new default values when pageType changes
     let defaultContentValues = {};
     if (watchedPageType === 'home') {
        const homeContent = (initialData?.pageType === 'home' ? (initialData as HomePage).content : HomePageContentSchema.parse({})) || {};
        defaultContentValues = {
          homeHeroHeading: homeContent.heroSection?.slides?.[0]?.heading || '',
          homeWhyChooseIntroHeading: homeContent.whyChoose?.introHeading || '',
          // ... other home fields
        };
     } else if (watchedPageType === 'about-us') {
        // defaultContentValues for about-us
     }
      reset({
        title: initialData?.title || watchedTitle || '',
        slug: initialData?.slug || (watchedTitle ? generateSlug(watchedTitle) : '') || '',
        status: initialData?.status || 'Draft',
        author: initialData?.author || 'Admin',
        pageType: watchedPageType,
        ...defaultContentValues,
        // Reset specific content fields based on new pageType
        // For example, if switching away from 'home', clear home-specific fields
        homeHeroHeading: watchedPageType === 'home' ? ((initialData?.pageType === 'home' ? (initialData as HomePage).content?.heroSection?.slides?.[0]?.heading : '') || '') : '',
        homeWhyChooseIntroHeading: watchedPageType === 'home' ? ((initialData?.pageType === 'home' ? (initialData as HomePage).content?.whyChoose?.introHeading : '') || '') : '',
      });

      // Populate hero slides if initialData is for home page
      if (initialData?.pageType === 'home' && watchedPageType === 'home') {
        const homeData = initialData as HomePage;
        if (homeData.content?.heroSection?.slides) {
          setValue('content.heroSection.slides' as any, homeData.content.heroSection.slides);
        }
      }


  }, [watchedPageType, initialData, reset, setValue, watchedTitle]);


  useEffect(() => {
    if (watchedTitle && !initialData?.slug && !initialData?.title) {
      setValue("slug", generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, initialData]);

  const checkSlugUniqueness = useCallback(
    async (slugToCheck: string) => {
      if (!slugToCheck) return;
      if (initialData && initialData.slug === slugToCheck) {
        clearErrors("slug");
        setSlugCustomError(null);
        return;
      }
      setIsCheckingSlug(true);
      setSlugCustomError(null);
      clearErrors("slug");
      try {
        const q = query(collection(db, "pages"), where("slug", "==", slugToCheck));
        const querySnapshot = await getDocs(q);
        let slugIsTaken = false;
        if (!querySnapshot.empty) {
          if (initialData) {
            querySnapshot.forEach(doc => { if (doc.id !== initialData.id) slugIsTaken = true; });
          } else {
            slugIsTaken = true;
          }
        }
        if (slugIsTaken) {
          setError("slug", { type: "manual", message: "This slug is already in use." });
          setSlugCustomError("This slug is already in use.");
        } else {
           clearErrors("slug"); 
           setSlugCustomError(null);
        }
      } catch (error) {
        console.error("Error checking slug uniqueness:", error);
        toast({ title: "Error", description: "Could not verify slug uniqueness.", variant: "destructive" });
      } finally {
        setIsCheckingSlug(false);
      }
    },
    [initialData, setError, clearErrors, toast]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (watchedSlug && (basePageFormSchema.shape.slug.safeParse(watchedSlug).success)) {
         checkSlugUniqueness(watchedSlug);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [watchedSlug, checkSlugUniqueness]);

  const handleActualSubmit = (data: z.infer<typeof pageFormValidationSchema>) => {
    const baseValues: PageFormValues = {
      title: data.title,
      slug: data.slug,
      status: data.status,
      author: data.author,
      pageType: data.pageType,
    };

    let pageContent: any = {};

    if (data.pageType === 'home') {
      pageContent = HomePageContentSchema.parse({
        heroSection: {
          slides: (data as any)['content.heroSection.slides']?.map((slide: any) => ({ // Use field array data
            heading: slide.heading,
            paragraph: slide.paragraph,
            imgSrc: slide.imgSrc,
            alt: slide.alt,
            btnText: slide.btnText,
            btnLink: slide.btnLink,
          })) || (initialData?.pageType === 'home' ? (initialData as HomePage).content.heroSection?.slides : [])
        },
        whyChoose: {
          introHeading: data.homeWhyChooseIntroHeading || (initialData?.pageType === 'home' ? (initialData as HomePage).content.whyChoose?.introHeading : undefined),
          // ... parse other 'whyChoose' fields if you add inputs for them
        },
        // ... parse other sections for Home Page
      });
    } else if (data.pageType === 'about-us') {
      // pageContent = AboutUsPageContentSchema.parse({ ... initialData content if exists });
      // ... logic to gather content for 'about-us' page from form fields
    }
    // Add more else if blocks for other page types

    onSubmit(baseValues, data.pageType, pageContent);
  };


  return (
    <ScrollArea className="h-[70vh] sm:h-auto sm:max-h-[80vh] pr-6">
      <form onSubmit={handleSubmit(handleActualSubmit)} className="space-y-4 py-4">
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
          {isCheckingSlug && <p className="text-sm text-muted-foreground mt-1">Checking slug...</p>}
          <p className="text-xs text-muted-foreground mt-1">Unique URL path. Allows lowercase, numbers, hyphens, and slashes.</p>
        </div>

        <div>
          <Label htmlFor="pageType">Page Type</Label>
          <Controller
            name="pageType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(value) => { field.onChange(value); setCurrentContentType(value as PageType);}} defaultValue={field.value}>
                <SelectTrigger id="pageType">
                  <SelectValue placeholder="Select page type" />
                </SelectTrigger>
                <SelectContent>
                  {pageTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">{type.replace('-', ' ')}</SelectItem>
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

        {/* Content fields based on pageType */}
        {currentContentType === 'home' && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold">Home Page Content</h3>
            
            {/* Hero Section */}
            <div className="space-y-2 p-3 border rounded-md">
              <Label className="text-md font-medium">Hero Section</Label>
              {heroSlidesFields.map((item, index) => (
                <div key={item.id} className="space-y-2 p-2 border rounded">
                  <Label htmlFor={`content.heroSection.slides.${index}.heading`}>Slide {index + 1} Heading</Label>
                  <Input {...register(`content.heroSection.slides.${index}.heading` as any)} placeholder="Hero slide heading" />
                  
                  <Label htmlFor={`content.heroSection.slides.${index}.paragraph`}>Slide {index + 1} Paragraph</Label>
                  <Textarea {...register(`content.heroSection.slides.${index}.paragraph` as any)} placeholder="Hero slide paragraph" />

                  <Label htmlFor={`content.heroSection.slides.${index}.imgSrc`}>Slide {index + 1} Image URL</Label>
                  <Input {...register(`content.heroSection.slides.${index}.imgSrc` as any)} placeholder="https://example.com/image.jpg" />
                  
                  <Label htmlFor={`content.heroSection.slides.${index}.alt`}>Slide {index + 1} Image Alt Text</Label>
                  <Input {...register(`content.heroSection.slides.${index}.alt` as any)} placeholder="Image alt text" />

                  <Label htmlFor={`content.heroSection.slides.${index}.btnText`}>Slide {index + 1} Button Text</Label>
                  <Input {...register(`content.heroSection.slides.${index}.btnText` as any)} placeholder="Learn More" />

                  <Label htmlFor={`content.heroSection.slides.${index}.btnLink`}>Slide {index + 1} Button Link</Label>
                  <Input {...register(`content.heroSection.slides.${index}.btnLink` as any)} placeholder="https://example.com/learn" />
                  
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeHeroSlide(index)}>
                    <Trash2 className="mr-1 h-3 w-3"/> Remove Slide
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendHeroSlide({ heading: '', paragraph: '', imgSrc: '', alt: '', btnText: '', btnLink: '' })}>
                <PlusCircle className="mr-1 h-3 w-3"/> Add Hero Slide
              </Button>
            </div>

            {/* Why Choose Section */}
            <div className="space-y-2 p-3 border rounded-md">
              <Label className="text-md font-medium">Why Choose Apollo Section</Label>
              <div>
                <Label htmlFor="homeWhyChooseIntroHeading">Intro Heading</Label>
                <Input id="homeWhyChooseIntroHeading" {...register("homeWhyChooseIntroHeading")} placeholder="Why Choose Us?" />
              </div>
              {/* Add more fields for features array here if needed, similar to Hero Slides */}
            </div>
            {/* Add more collapsible sections for other Home Page content parts */}
          </div>
        )}

        {currentContentType === 'about-us' && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold">About Us Page Content</h3>
            {/* Add form fields for About Us page schema here */}
            {/* Example:
            <div>
              <Label htmlFor="aboutBannerHeading">Banner Heading</Label>
              <Input id="aboutBannerHeading" {...register("aboutContent.banner.heading" as any)} />
            </div>
            */}
             <p className="text-sm text-muted-foreground">About Us content fields will go here.</p>
          </div>
        )}
        {/* Add more conditional rendering blocks for other page types */}


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isCheckingSlug}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isCheckingSlug || !!slugError || !!errors.slug}>
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Page')}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}
