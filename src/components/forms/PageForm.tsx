
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
import type { Page, HomePage, AboutUsPage, AdmissionsPage, ContactPage, ProgramsListingPage, IndividualProgramPage, CentresOverviewPage, IndividualCentrePage, EnquiryPage } from '@/app/(app)/pages/page';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

import { HomePageContentSchema, HeroSlideSchema, WhyChooseFeatureSchema, ProgramItemSchema, CounterItemSchema, CentreItemSchema as HomeCentreItemSchema, AccreditationLogoSchema, GlobalPartnerSchema } from '@/schemas/pages/homePageSchema';
import { AboutUsPageContentSchema, MissionPointSchema, TimelineEventSchema } from '@/schemas/pages/aboutUsPageSchema';
import { AdmissionsPageContentSchema, ApplicationStepSchema, FaqItemSchema } from '@/schemas/pages/admissionsPageSchema';
import { ContactPageContentSchema } from '@/schemas/pages/contactPageSchema';
import { ProgramsListingPageContentSchema, ProgramTabSchema, ProgramCardSchema } from '@/schemas/pages/programsListingPageSchema';
import { IndividualProgramPageContentSchema, StringListItemSchema as IndividualProgramStringListItemSchema } from '@/schemas/pages/individualProgramPageSchema'; // FaqItemSchema re-exported
import { CentresOverviewPageContentSchema, CentreCardSchema as OverviewCentreCardSchema } from '@/schemas/pages/centresOverviewPageSchema';
import { IndividualCentrePageContentSchema, CentreFeatureSchema as IndividualCentreFeatureSchema } from '@/schemas/pages/individualCentrePageSchema';
import { EnquiryPageContentSchema, EnquiryFormFieldSchema } from '@/schemas/pages/enquiryPageSchema';


import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const pageStatuses = ["Draft", "Published", "Review"] as const;
export type PageStatus = typeof pageStatuses[number];

export const pageTypes = [
    "generic", 
    "home", 
    "about-us", 
    "admissions", 
    "programs", 
    "program-detail", 
    "centres", 
    "centre-detail", 
    "contact", 
    "enquiry"
] as const;
export type PageType = typeof pageTypes[number];


const basePageFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9/-]+)*$/, "Slug must be lowercase alphanumeric with hyphens/slashes"),
  status: z.enum(pageStatuses),
  author: z.string().min(1, "Author is required").max(50, "Author name must be 50 characters or less"),
  pageType: z.enum(pageTypes).default('generic'),
});

const pageFormValidationSchema = basePageFormSchema.extend({
  content: z.any().optional(), 
});


export type PageFormValues = z.infer<typeof basePageFormSchema>;

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

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch, setError, clearErrors, reset, getValues } = useForm<z.infer<typeof pageFormValidationSchema>>({
    resolver: zodResolver(pageFormValidationSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'Draft',
      author: initialData?.author || 'Admin',
      pageType: initialData?.pageType || 'generic',
      content: initialData?.content || {},
    },
  });
  
  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedPageType = watch("pageType");

  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugCustomError] = useState<string | null>(null);

  // Field Array Hooks
  const { fields: heroSlidesFields, append: appendHeroSlide, remove: removeHeroSlide } = useFieldArray({ control, name: "content.heroSection.slides" });
  const { fields: whyChooseFeaturesFields, append: appendWhyChooseFeature, remove: removeWhyChooseFeature } = useFieldArray({ control, name: "content.whyChoose.features" });
  const { fields: homeProgramsFields, append: appendHomeProgram, remove: removeHomeProgram } = useFieldArray({ control, name: "content.programsList.programs" });
  const { fields: countersFields, append: appendCounter, remove: removeCounter } = useFieldArray({ control, name: "content.counters.counters" });
  const { fields: homeCentresFields, append: appendHomeCentre, remove: removeHomeCentre } = useFieldArray({ control, name: "content.centres.centres" });
  const { fields: accreditationsFields, append: appendAccreditation, remove: removeAccreditation } = useFieldArray({ control, name: "content.accreditations.logos" });
  const { fields: globalPartnershipsFields, append: appendGlobalPartnership, remove: removeGlobalPartnership } = useFieldArray({ control, name: "content.globalPartnerships.partners" });
  
  const { fields: applicationStepsFields, append: appendApplicationStep, remove: removeApplicationStep } = useFieldArray({ control, name: "content.applicationSteps.steps" });
  const { fields: admissionsFaqsFields, append: appendAdmissionsFaq, remove: removeAdmissionsFaq } = useFieldArray({ control, name: "content.admissionsFaq.faqs" });

  const { fields: missionPointsFields, append: appendMissionPoint, remove: removeMissionPoint } = useFieldArray({ control, name: "content.visionMission.missionPoints" });
  const { fields: timelineEventsFields, append: appendTimelineEvent, remove: removeTimelineEvent } = useFieldArray({ control, name: "content.timelineSection.events" });

  const { fields: programTabsFields, append: appendProgramTab, remove: removeProgramTab } = useFieldArray({ control, name: "content.programTabs.tabs" });
  const { fields: programCardsFields, append: appendProgramCard, remove: removeProgramCard } = useFieldArray({ control, name: "content.programCards.programs" });
  
  const { fields: programHighlightsFields, append: appendProgramHighlight, remove: removeProgramHighlight } = useFieldArray({ control, name: "content.overviewSection.highlights" });
  
  const { fields: programYear1SubjectsFields, append: appendProgramYear1Subject, remove: removeProgramYear1Subject } = useFieldArray({ control, name: "content.curriculumSection.yearWiseSubjects.year1" });
  const { fields: programYear2SubjectsFields, append: appendProgramYear2Subject, remove: removeProgramYear2Subject } = useFieldArray({ control, name: "content.curriculumSection.yearWiseSubjects.year2" });
  const { fields: programYear3SubjectsFields, append: appendProgramYear3Subject, remove: removeProgramYear3Subject } = useFieldArray({ control, name: "content.curriculumSection.yearWiseSubjects.year3" });
  
  const { fields: careerOpportunitiesFields, append: appendCareerOpportunity, remove: removeCareerOpportunity } = useFieldArray({ control, name: "content.careerOpportunities.careers" });
  const { fields: programFaqsFields, append: appendProgramFaq, remove: removeProgramFaq } = useFieldArray({ control, name: "content.programFaqs.faqs" });

  const { fields: centreCardsFields, append: appendCentreCard, remove: removeCentreCard } = useFieldArray({ control, name: "content.centreCards.centres" });
  
  const { fields: centreFeaturesFields, append: appendCentreFeature, remove: removeCentreFeature } = useFieldArray({ control, name: "content.centreInfo.features" });
  
  const { fields: enquiryFormFields, append: appendEnquiryFormField, remove: removeEnquiryFormField } = useFieldArray({ control, name: "content.enquiryForm.fields" });


  useEffect(() => {
    const newPageType = watchedPageType || 'generic';
    setCurrentContentType(newPageType);

    const currentValues = getValues();
    let newContentDefaults = {};

    try {
      switch (newPageType) {
          case 'home':
              newContentDefaults = initialData?.pageType === 'home' ? (initialData as HomePage).content : HomePageContentSchema.parse({});
              break;
          case 'about-us':
              newContentDefaults = initialData?.pageType === 'about-us' ? (initialData as AboutUsPage).content : AboutUsPageContentSchema.parse({});
              break;
          case 'admissions':
              newContentDefaults = initialData?.pageType === 'admissions' ? (initialData as AdmissionsPage).content : AdmissionsPageContentSchema.parse({});
              break;
          case 'contact':
              newContentDefaults = initialData?.pageType === 'contact' ? (initialData as ContactPage).content : ContactPageContentSchema.parse({});
              break;
          case 'programs':
              newContentDefaults = initialData?.pageType === 'programs' ? (initialData as ProgramsListingPage).content : ProgramsListingPageContentSchema.parse({});
              break;
          case 'program-detail':
              newContentDefaults = initialData?.pageType === 'program-detail' ? (initialData as IndividualProgramPage).content : IndividualProgramPageContentSchema.parse({});
              break;
          case 'centres':
              newContentDefaults = initialData?.pageType === 'centres' ? (initialData as CentresOverviewPage).content : CentresOverviewPageContentSchema.parse({});
              break;
          case 'centre-detail':
              newContentDefaults = initialData?.pageType === 'centre-detail' ? (initialData as IndividualCentrePage).content : IndividualCentrePageContentSchema.parse({});
              break;
          case 'enquiry':
              newContentDefaults = initialData?.pageType === 'enquiry' ? (initialData as EnquiryPage).content : EnquiryPageContentSchema.parse({});
              break;
          default:
              newContentDefaults = (initialData?.pageType === 'generic' && initialData.content) ? initialData.content : {};
              break;
      }
    } catch(e) {
        console.error("Error parsing default content for page type:", newPageType, e);
        toast({ title: "Form Initialization Error", description: `Could not initialize content for page type ${newPageType}.`, variant: "destructive"});
        newContentDefaults = {}; // Fallback to empty object
    }
    
    reset({
        title: currentValues.title || initialData?.title || '',
        slug: currentValues.slug || initialData?.slug || (currentValues.title ? generateSlug(currentValues.title) : ''),
        status: currentValues.status || initialData?.status || 'Draft',
        author: currentValues.author || initialData?.author || 'Admin',
        pageType: newPageType,
        content: newContentDefaults,
    });

  }, [watchedPageType, initialData, reset, getValues, toast]);


  useEffect(() => {
    if (watchedTitle && !initialData?.slug && !initialData?.title && !getValues("slug")) {
      setValue("slug", generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, initialData, getValues]);

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
    const contentFromForm = data.content || {};

    try {
        switch (data.pageType) {
            case 'home':
                pageContent = HomePageContentSchema.parse(contentFromForm);
                break;
            case 'about-us':
                pageContent = AboutUsPageContentSchema.parse(contentFromForm);
                break;
            case 'admissions':
                pageContent = AdmissionsPageContentSchema.parse(contentFromForm);
                break;
            case 'contact':
                pageContent = ContactPageContentSchema.parse(contentFromForm);
                break;
            case 'programs':
                pageContent = ProgramsListingPageContentSchema.parse(contentFromForm);
                break;
            case 'program-detail':
                pageContent = IndividualProgramPageContentSchema.parse(contentFromForm);
                break;
            case 'centres':
                pageContent = CentresOverviewPageContentSchema.parse(contentFromForm);
                break;
            case 'centre-detail':
                pageContent = IndividualCentrePageContentSchema.parse(contentFromForm);
                break;
            case 'enquiry':
                pageContent = EnquiryPageContentSchema.parse(contentFromForm);
                break;
            default: 
                pageContent = contentFromForm; 
                break;
        }
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error("Content validation error:", e.errors);
            toast({
                title: "Content Validation Error",
                description: `There are issues with the content for page type "${data.pageType}". Check console for details.`,
                variant: "destructive"
            });
            return; 
        }
        throw e; 
    }
    onSubmit(baseValues, data.pageType, pageContent);
  };


  const renderFieldArray = (
    fields: any[], 
    removeFn: (index: number) => void, 
    appendFn: (value: any) => void, 
    baseName: string, 
    itemSchema: Record<string, { label: string; type: 'input' | 'textarea' | 'select'; options?: string[]; placeholder?: string }>,
    itemDefaultGenerator: () => any, // Changed to a generator function
    sectionTitle: string
  ) => (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="text-md">{sectionTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-3 bg-muted/50">
            <div className="space-y-2">
              {Object.entries(itemSchema).map(([key, schema]) => (
                <div key={key}>
                  <Label htmlFor={`${baseName}.${index}.${key}`}>{schema.label}</Label>
                  {schema.type === 'textarea' ? (
                    <Textarea {...register(`${baseName}.${index}.${key}` as const)} placeholder={schema.placeholder || `Enter ${schema.label.toLowerCase()}`} />
                  ) : schema.type === 'select' && schema.options ? (
                     <Controller
                        name={`${baseName}.${index}.${key}` as const}
                        control={control}
                        render={({ field: selectField }) => (
                           <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                            <SelectTrigger><SelectValue placeholder={`Select ${schema.label.toLowerCase()}`} /></SelectTrigger>
                            <SelectContent>
                              {schema.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      />
                  ) : (
                    <Input {...register(`${baseName}.${index}.${key}` as const)} placeholder={schema.placeholder || `Enter ${schema.label.toLowerCase()}`} />
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={() => removeFn(index)} className="mt-2">
              <Trash2 className="mr-1 h-3 w-3"/> Remove Item
            </Button>
          </Card>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => appendFn(itemDefaultGenerator())}>
          <PlusCircle className="mr-1 h-3 w-3"/> Add Item
        </Button>
      </CardContent>
    </Card>
  );


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
          <Input id="slug" {...register("slug")} placeholder="e.g., my-awesome-page or programs/my-program" />
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
              <Select onValueChange={(value) => { field.onChange(value); }} defaultValue={field.value}>
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

        {currentContentType === 'home' && (
          <Card className="border-t pt-4 mt-4">
            <CardHeader><CardTitle className="text-lg">Home Page Content</CardTitle><CardDescription>Manage content for the Home page.</CardDescription></CardHeader>
            <CardContent>
              {renderFieldArray(
                heroSlidesFields, removeHeroSlide, () => appendHeroSlide(HeroSlideSchema.parse({})), "content.heroSection.slides",
                { 
                  imgSrc: { label: "Image URL", type: 'input', placeholder: "https://placehold.co/1920x1080.png" },
                  alt: { label: "Image Alt Text", type: 'input', placeholder: "Descriptive alt text" },
                  heading: { label: "Heading", type: 'input', placeholder: "Hero slide heading" },
                  paragraph: { label: "Paragraph", type: 'textarea', placeholder: "Hero slide paragraph" },
                  btnText: { label: "Button Text", type: 'input', placeholder: "Learn More" },
                  btnLink: { label: "Button Link", type: 'input', placeholder: "/about-us" },
                },
                () => HeroSlideSchema.parse({}), "Hero Slides"
              )}
              <Card className="my-4"><CardHeader><CardTitle className="text-md">Why Choose Apollo</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div><Label htmlFor="content.whyChoose.introHeading">Intro Heading</Label><Input {...register("content.whyChoose.introHeading")} placeholder="Why Choose Us?" /></div>
                  <div><Label htmlFor="content.whyChoose.introParagraph">Intro Paragraph</Label><Textarea {...register("content.whyChoose.introParagraph")} placeholder="Detailed description..." /></div>
                  {renderFieldArray(
                    whyChooseFeaturesFields, removeWhyChooseFeature, () => appendWhyChooseFeature(WhyChooseFeatureSchema.parse({})), "content.whyChoose.features",
                    {
                      iconSrc: { label: "Icon Source (e.g., lucide:Home)", type: 'input', placeholder: "lucide:Award" },
                      title: { label: "Feature Title", type: 'input' },
                      description: { label: "Feature Description", type: 'textarea' },
                    },
                    () => WhyChooseFeatureSchema.parse({}), "Features"
                  )}
                </CardContent>
              </Card>
              <Card className="my-4"><CardHeader><CardTitle className="text-md">Programs List Section</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div><Label htmlFor="content.programsList.sectionHeading">Section Heading</Label><Input {...register("content.programsList.sectionHeading")} /></div>
                    <div><Label htmlFor="content.programsList.sectionIntro">Section Intro</Label><Textarea {...register("content.programsList.sectionIntro")} /></div>
                    {renderFieldArray(
                        homeProgramsFields, removeHomeProgram, () => appendHomeProgram(ProgramItemSchema.parse({})), "content.programsList.programs",
                        {
                            imgSrc: { label: "Image URL", type: 'input' }, alt: { label: "Image Alt", type: 'input' },
                            title: { label: "Program Title", type: 'input' }, description: { label: "Program Description", type: 'textarea' },
                            btnLink: { label: "Button Link", type: 'input' }
                        },
                        () => ProgramItemSchema.parse({}), "Programs"
                    )}
                </CardContent>
              </Card>
               {renderFieldArray(
                    countersFields, removeCounter, () => appendCounter(CounterItemSchema.parse({})), "content.counters.counters",
                    { value: { label: "Counter Value", type: 'input' }, label: { label: "Counter Label", type: 'input' }},
                    () => CounterItemSchema.parse({}), "Counters"
                )}
              <Card className="my-4"><CardHeader><CardTitle className="text-md">Centres Section</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div><Label htmlFor="content.centres.sectionHeading">Section Heading</Label><Input {...register("content.centres.sectionHeading")} /></div>
                    {renderFieldArray(
                        homeCentresFields, removeHomeCentre, () => appendHomeCentre(HomeCentreItemSchema.parse({})), "content.centres.centres",
                        {
                            imgSrc: { label: "Image URL", type: 'input' }, alt: { label: "Image Alt", type: 'input' },
                            name: { label: "Centre Name", type: 'input' }, description: { label: "Centre Description", type: 'textarea' },
                            btnLink: { label: "Button Link", type: 'input' }
                        },
                        () => HomeCentreItemSchema.parse({}), "Centres"
                    )}
                </CardContent>
              </Card>
              <Card className="my-4"><CardHeader><CardTitle className="text-md">Accreditations</CardTitle></CardHeader>
                <CardContent>
                  {renderFieldArray(
                      accreditationsFields, removeAccreditation, () => appendAccreditation(AccreditationLogoSchema.parse({})), "content.accreditations.logos",
                      { imgSrc: { label: "Logo Image URL", type: 'input' }, alt: { label: "Logo Alt", type: 'input' }, name: { label: "Accreditation Name", type: 'input' }},
                      () => AccreditationLogoSchema.parse({}), "Accreditation Logos"
                  )}
                </CardContent>
              </Card>
              <Card className="my-4"><CardHeader><CardTitle className="text-md">Global Partnerships Section</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div><Label htmlFor="content.globalPartnerships.sectionHeading">Section Heading</Label><Input {...register("content.globalPartnerships.sectionHeading")} /></div>
                    {renderFieldArray(
                        globalPartnershipsFields, removeGlobalPartnership, () => appendGlobalPartnership(GlobalPartnerSchema.parse({})), "content.globalPartnerships.partners",
                        { imgSrc: { label: "Partner Logo URL", type: 'input' }, alt: { label: "Partner Alt", type: 'input' }, name: { label: "Partner Name", type: 'input' }},
                        () => GlobalPartnerSchema.parse({}), "Partners"
                    )}
                </CardContent>
              </Card>
              <Card className="my-4"><CardHeader><CardTitle className="text-md">Enquire CTA Section</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div><Label htmlFor="content.ctaSection.heading">Heading</Label><Input {...register("content.ctaSection.heading")} /></div>
                    <div><Label htmlFor="content.ctaSection.buttonText">Button Text</Label><Input {...register("content.ctaSection.buttonText")} /></div>
                    <div><Label htmlFor="content.ctaSection.buttonLink">Button Link</Label><Input {...register("content.ctaSection.buttonLink")} /></div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {currentContentType === 'admissions' && (
          <Card className="border-t pt-4 mt-4">
            <CardHeader><CardTitle className="text-lg">Admissions Page Content</CardTitle><CardDescription>Manage content for the Admissions page.</CardDescription></CardHeader>
            <CardContent>
              <Card className="my-4"><CardHeader><CardTitle className="text-md">Application Steps</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div><Label htmlFor="content.applicationSteps.mainHeading">Main Heading</Label><Input {...register("content.applicationSteps.mainHeading")} /></div>
                  {renderFieldArray(
                    applicationStepsFields, removeApplicationStep, () => appendApplicationStep(ApplicationStepSchema.parse({})), "content.applicationSteps.steps",
                    {
                      number: { label: "Step Number", type: 'input', placeholder: "e.g., 1 or Step One" },
                      title: { label: "Step Title", type: 'input' },
                      description: { label: "Step Description", type: 'textarea' },
                    },
                    () => ApplicationStepSchema.parse({}), "Steps"
                  )}
                </CardContent>
              </Card>
              <Card className="my-4"><CardHeader><CardTitle className="text-md">FAQ Section</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div><Label htmlFor="content.admissionsFaq.sectionHeading">Section Heading</Label><Input {...register("content.admissionsFaq.sectionHeading")} /></div>
                  {renderFieldArray(
                    admissionsFaqsFields, removeAdmissionsFaq, () => appendAdmissionsFaq(FaqItemSchema.parse({})), "content.admissionsFaq.faqs",
                    {
                      question: { label: "Question", type: 'input' },
                      answer: { label: "Answer", type: 'textarea' },
                    },
                    () => FaqItemSchema.parse({}), "FAQs"
                  )}
                </CardContent>
              </Card>
              <Card className="my-4"><CardHeader><CardTitle className="text-md">Eligibility & Info CTA</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div><Label htmlFor="content.eligibilitySection.eligibilityCriteria">Eligibility Criteria</Label><Textarea {...register("content.eligibilitySection.eligibilityCriteria")} /></div>
                  <div><Label htmlFor="content.eligibilitySection.durationInfo">Duration Info</Label><Input {...register("content.eligibilitySection.durationInfo")} /></div>
                  <div><Label htmlFor="content.eligibilitySection.feeStructure">Fee Structure</Label><Input {...register("content.eligibilitySection.feeStructure")} /></div>
                  <div><Label htmlFor="content.eligibilitySection.buttonText">Button Text</Label><Input {...register("content.eligibilitySection.buttonText")} /></div>
                  <div><Label htmlFor="content.eligibilitySection.buttonLink">Button Link</Label><Input {...register("content.eligibilitySection.buttonLink")} /></div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {currentContentType === 'about-us' && (
          <Card className="border-t pt-4 mt-4">
            <CardHeader><CardTitle className="text-lg">About Us Page Content</CardTitle><CardDescription>Manage content for the About Us page.</CardDescription></CardHeader>
            <CardContent>
                <Card className="my-4"><CardHeader><CardTitle className="text-md">Banner</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div><Label htmlFor="content.banner.heading">Heading</Label><Input {...register("content.banner.heading")} /></div>
                        <div><Label htmlFor="content.banner.subheading">Subheading</Label><Input {...register("content.banner.subheading")} /></div>
                        <div><Label htmlFor="content.banner.backgroundImage">Background Image URL</Label><Input {...register("content.banner.backgroundImage")} /></div>
                    </CardContent>
                </Card>
                <Card className="my-4"><CardHeader><CardTitle className="text-md">Vision & Mission</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div><Label htmlFor="content.visionMission.visionText">Vision Text</Label><Textarea {...register("content.visionMission.visionText")} /></div>
                        {renderFieldArray(
                            missionPointsFields, removeMissionPoint, () => appendMissionPoint(MissionPointSchema.parse({})), "content.visionMission.missionPoints",
                            { point: { label: "Mission Point", type: 'input' } }, 
                            () => MissionPointSchema.parse({}), "Mission Points"
                        )}
                    </CardContent>
                </Card>
                 <Card className="my-4"><CardHeader><CardTitle className="text-md">Timeline / History</CardTitle></CardHeader>
                    <CardContent>
                        {renderFieldArray(
                            timelineEventsFields, removeTimelineEvent, () => appendTimelineEvent(TimelineEventSchema.parse({})), "content.timelineSection.events",
                            { year: { label: "Year", type: 'input' }, event: { label: "Event Description", type: 'textarea' }},
                            () => TimelineEventSchema.parse({}), "Timeline Events"
                        )}
                    </CardContent>
                </Card>
            </CardContent>
          </Card>
        )}

        {currentContentType === 'programs' && (
           <Card className="border-t pt-4 mt-4">
            <CardHeader><CardTitle className="text-lg">Programs Listing Page Content</CardTitle><CardDescription>Manage content for the Programs Listing page.</CardDescription></CardHeader>
            <CardContent>
                {renderFieldArray(
                    programTabsFields, removeProgramTab, () => appendProgramTab(ProgramTabSchema.parse({})), "content.programTabs.tabs",
                    { title: { label: "Tab Title", type: 'input' }, anchorLink: { label: "Anchor Link (e.g. #category)", type: 'input' } },
                    () => ProgramTabSchema.parse({}), "Program Categories (Tabs)"
                )}
                {renderFieldArray(
                    programCardsFields, removeProgramCard, () => appendProgramCard(ProgramCardSchema.parse({})), "content.programCards.programs",
                    {
                        title: { label: "Program Title", type: 'input' }, imgSrc: { label: "Image URL", type: 'input' },
                        alt: { label: "Image Alt", type: 'input' }, description: { label: "Description", type: 'textarea' },
                        duration: { label: "Duration", type: 'input' }, btnLink: { label: "Details Link", type: 'input' }
                    },
                    () => ProgramCardSchema.parse({}), "Program Cards"
                )}
            </CardContent>
           </Card>
        )}

        {currentContentType === 'program-detail' && (
            <Card className="border-t pt-4 mt-4">
                <CardHeader><CardTitle className="text-lg">Individual Program Page Content</CardTitle><CardDescription>Manage content for an Individual Program page.</CardDescription></CardHeader>
                <CardContent>
                    <Card className="my-4"><CardHeader><CardTitle className="text-md">Hero Section</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div><Label htmlFor="content.programHero.heading">Heading</Label><Input {...register("content.programHero.heading")} /></div>
                            <div><Label htmlFor="content.programHero.subheading">Subheading</Label><Input {...register("content.programHero.subheading")} /></div>
                            <div><Label htmlFor="content.programHero.heroImage">Hero Image URL</Label><Input {...register("content.programHero.heroImage")} /></div>
                            <div><Label htmlFor="content.programHero.btnText">Button Text</Label><Input {...register("content.programHero.btnText")} /></div>
                            <div><Label htmlFor="content.programHero.btnLink">Button Link</Label><Input {...register("content.programHero.btnLink")} /></div>
                        </CardContent>
                    </Card>
                    <Card className="my-4"><CardHeader><CardTitle className="text-md">Overview</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div><Label htmlFor="content.overviewSection.introText">Intro Text</Label><Textarea {...register("content.overviewSection.introText")} /></div>
                            {renderFieldArray(
                                programHighlightsFields, removeProgramHighlight, () => appendProgramHighlight(IndividualProgramStringListItemSchema.parse({})), "content.overviewSection.highlights",
                                { value: {label: "Highlight", type: "input"} }, 
                                () => IndividualProgramStringListItemSchema.parse({}), "Highlights"
                            )}
                        </CardContent>
                    </Card>
                    <Card className="my-4"><CardHeader><CardTitle className="text-md">Curriculum</CardTitle></CardHeader>
                        <CardContent>
                             {renderFieldArray(programYear1SubjectsFields, removeProgramYear1Subject, () => appendProgramYear1Subject(IndividualProgramStringListItemSchema.parse({value: ''})), "content.curriculumSection.yearWiseSubjects.year1", { value: { label: "Subject", type: 'input'}}, () => IndividualProgramStringListItemSchema.parse({value: ''}), "Year 1 Subjects")}
                             {renderFieldArray(programYear2SubjectsFields, removeProgramYear2Subject, () => appendProgramYear2Subject(IndividualProgramStringListItemSchema.parse({value: ''})), "content.curriculumSection.yearWiseSubjects.year2", { value: { label: "Subject", type: 'input'}}, () => IndividualProgramStringListItemSchema.parse({value: ''}), "Year 2 Subjects")}
                             {renderFieldArray(programYear3SubjectsFields, removeProgramYear3Subject, () => appendProgramYear3Subject(IndividualProgramStringListItemSchema.parse({value: ''})), "content.curriculumSection.yearWiseSubjects.year3", { value: { label: "Subject", type: 'input'}}, () => IndividualProgramStringListItemSchema.parse({value: ''}), "Year 3 Subjects")}
                        </CardContent>
                    </Card>
                    <Card className="my-4"><CardHeader><CardTitle className="text-md">Eligibility & Duration</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div><Label htmlFor="content.eligibilityDuration.eligibility">Eligibility</Label><Textarea {...register("content.eligibilityDuration.eligibility")} /></div>
                            <div><Label htmlFor="content.eligibilityDuration.duration">Duration</Label><Input {...register("content.eligibilityDuration.duration")} /></div>
                        </CardContent>
                    </Card>
                     <Card className="my-4"><CardHeader><CardTitle className="text-md">Career Opportunities</CardTitle></CardHeader>
                        <CardContent>
                           {renderFieldArray(careerOpportunitiesFields, removeCareerOpportunity, () => appendCareerOpportunity(IndividualProgramStringListItemSchema.parse({})), "content.careerOpportunities.careers", { value: { label: "Career Opportunity", type: 'input'}}, () => IndividualProgramStringListItemSchema.parse({}), "Career Opportunities")}
                        </CardContent>
                    </Card>
                     <Card className="my-4"><CardHeader><CardTitle className="text-md">Program FAQs</CardTitle></CardHeader>
                        <CardContent>
                            {renderFieldArray( // Using FaqItemSchema from admissions, re-exported by individualProgramPageSchema
                                programFaqsFields, removeProgramFaq, () => appendProgramFaq(FaqItemSchema.parse({})), "content.programFaqs.faqs", 
                                { question: { label: "Question", type: 'input' }, answer: { label: "Answer", type: 'textarea'}}, 
                                () => FaqItemSchema.parse({}), 
                                "Program FAQs"
                            )}
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        )}
        
        {currentContentType === 'centres' && (
            <Card className="border-t pt-4 mt-4">
                <CardHeader><CardTitle className="text-lg">Centres Overview Page Content</CardTitle><CardDescription>Manage content for the Centres Overview page.</CardDescription></CardHeader>
                <CardContent>
                    {renderFieldArray(
                        centreCardsFields, removeCentreCard, () => appendCentreCard(OverviewCentreCardSchema.parse({})), "content.centreCards.centres",
                        {
                            name: {label: "Centre Name", type: 'input'}, imgSrc: {label: "Image URL", type: 'input'},
                            alt: {label: "Image Alt", type: 'input'}, description: {label: "Description", type: 'textarea'},
                            btnLink: {label: "Details Link", type: 'input'}
                        },
                        () => OverviewCentreCardSchema.parse({}), "Centre Cards"
                    )}
                </CardContent>
            </Card>
        )}

        {currentContentType === 'centre-detail' && (
            <Card className="border-t pt-4 mt-4">
                <CardHeader><CardTitle className="text-lg">Individual Centre Page Content</CardTitle><CardDescription>Manage content for an Individual Centre page.</CardDescription></CardHeader>
                <CardContent>
                    <Card className="my-4"><CardHeader><CardTitle className="text-md">Centre Info</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div><Label htmlFor="content.centreInfo.heading">Heading</Label><Input {...register("content.centreInfo.heading")} /></div>
                            <div><Label htmlFor="content.centreInfo.paragraph">Paragraph</Label><Textarea {...register("content.centreInfo.paragraph")} /></div>
                            {renderFieldArray(
                                centreFeaturesFields, removeCentreFeature, () => appendCentreFeature(IndividualCentreFeatureSchema.parse({})), "content.centreInfo.features",
                                { icon: {label: "Icon (e.g. lucide:Home)", type: 'input'}, text: {label: "Feature Text", type: 'input'}},
                                () => IndividualCentreFeatureSchema.parse({}), "Features"
                            )}
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        )}

        {currentContentType === 'contact' && (
          <Card className="border-t pt-4 mt-4">
            <CardHeader><CardTitle className="text-lg">Contact Page Content</CardTitle><CardDescription>Manage content for the Contact page.</CardDescription></CardHeader>
            <CardContent>
                <Card className="my-4"><CardHeader><CardTitle className="text-md">Contact Form Fields (Labels)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div><Label htmlFor="content.contactForm.name">Name Field Label</Label><Input {...register("content.contactForm.name")} placeholder="e.g., Your Name" /></div>
                        <div><Label htmlFor="content.contactForm.email">Email Field Label</Label><Input {...register("content.contactForm.email")} placeholder="e.g., Your Email" /></div>
                        <div><Label htmlFor="content.contactForm.phone">Phone Field Label</Label><Input {...register("content.contactForm.phone")} placeholder="e.g., Your Phone" /></div>
                        <div><Label htmlFor="content.contactForm.message">Message Field Label</Label><Input {...register("content.contactForm.message")} placeholder="e.g., Your Message" /></div>
                        <div><Label htmlFor="content.contactForm.submitButtonText">Submit Button Text</Label><Input {...register("content.contactForm.submitButtonText")} placeholder="e.g., Send Message" /></div>
                    </CardContent>
                </Card>
                <Card className="my-4"><CardHeader><CardTitle className="text-md">Contact Info Block</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div><Label htmlFor="content.contactInfo.phone">Phone Number</Label><Input {...register("content.contactInfo.phone")} /></div>
                        <div><Label htmlFor="content.contactInfo.email">Email Address</Label><Input {...register("content.contactInfo.email")} /></div>
                        <div><Label htmlFor="content.contactInfo.address">Address</Label><Textarea {...register("content.contactInfo.address")} /></div>
                        <div><Label htmlFor="content.contactInfo.mapEmbed">Map Embed URL (iframe src)</Label><Input {...register("content.contactInfo.mapEmbed")} placeholder="Google Maps embed URL"/></div>
                    </CardContent>
                </Card>
            </CardContent>
          </Card>
        )}

        {currentContentType === 'enquiry' && (
             <Card className="border-t pt-4 mt-4">
                <CardHeader><CardTitle className="text-lg">Enquiry Page Content</CardTitle><CardDescription>Manage content for the Enquiry page.</CardDescription></CardHeader>
                <CardContent>
                    <Card className="my-4"><CardHeader><CardTitle className="text-md">Enquiry Form Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <div><Label htmlFor="content.enquiryForm.formTitle">Form Title</Label><Input {...register("content.enquiryForm.formTitle")} /></div>
                        <div><Label htmlFor="content.enquiryForm.submitButtonText">Submit Button Text</Label><Input {...register("content.enquiryForm.submitButtonText")} /></div>
                      </CardContent>
                    </Card>
                    {renderFieldArray(
                        enquiryFormFields, removeEnquiryFormField, () => appendEnquiryFormField(EnquiryFormFieldSchema.parse({})), "content.enquiryForm.fields",
                        {
                            label: {label: "Field Label", type: 'input'}, name: {label: "Field Name (unique key)", type: 'input'},
                            inputType: {label: "Input Type", type: 'select', options: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio']},
                            placeholder: {label: "Placeholder (optional)", type: 'input'},
                        },
                        () => EnquiryFormFieldSchema.parse({}), "Enquiry Form Fields"
                    )}
                </CardContent>
             </Card>
        )}

        {currentContentType === 'generic' && (
             <Card className="border-t pt-4 mt-4">
                <CardHeader><CardTitle className="text-lg">Generic Page Content</CardTitle><CardDescription>Manage generic content using Markdown or HTML.</CardDescription></CardHeader>
                <CardContent>
                    <Label htmlFor="content.mainContent">Main Content (Markdown or HTML)</Label>
                    <Controller
                        name="content.mainContent"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Textarea 
                                id="content.mainContent" 
                                {...field} 
                                placeholder="Enter content for the generic page..." 
                                rows={10}
                            />
                        )}
                    />
                    <p className="text-xs text-muted-foreground mt-1">For generic pages, you can use Markdown or basic HTML here. More structured content types offer specific fields.</p>
                </CardContent>
            </Card>
        )}


        <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background pb-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isCheckingSlug}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isCheckingSlug || !!slugError || !!Object.keys(errors).length}>
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Page')}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}
