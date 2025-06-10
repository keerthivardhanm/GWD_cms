
import { z } from 'zod';
// Re-use CentreFacilitySchema from overview for consistency in facility structure
import { CentreFacilitySchema } from './centresOverviewPageSchema'; 

export const GalleryImageSchema = z.object({
    imgSrc: z.string().url({message: "Invalid image URL"}).or(z.literal('')).optional().default(''),
    alt: z.string().optional().default(''),
    caption: z.string().optional().default(''),
}).default({});
export type GalleryImageType = z.infer<typeof GalleryImageSchema>;

export const IndividualCentrePageContentSchema = z.object({
  hero: z.object({
    heading: z.string().optional().default('').describe("Typically the centre name"),
    bannerImageSrc: z.string().url({ message: "Invalid image URL" }).or(z.literal('')).optional().default(''),
    bannerImageAlt: z.string().optional().default(''),
  }).optional().default({ heading: '', bannerImageSrc: '', bannerImageAlt: '' }),

  name: z.string().optional().default('').describe("Centre Name (can override hero heading if needed, or be the primary source)"),
  description: z.string().optional().default(''),
  imageSrc: z.string().url({ message: "Invalid image URL" }).or(z.literal('')).optional().default('').describe("Main image for the centre if different from banner"),
  imageAlt: z.string().optional().default(''),
  
  contactInfo: z.object({
    address: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    email: z.string().email({ message: "Invalid email format" }).or(z.literal('')).optional().default(''),
  }).optional().default({ address: '', phone: '', email: '' }),
  
  facilitiesSection: z.object({
      heading: z.string().optional().default('Key Facilities'),
      facilities: z.array(CentreFacilitySchema).optional().default([]),
  }).optional().default({ heading: 'Key Facilities', facilities: [] }),

  gallery: z.array(GalleryImageSchema).optional().default([]),
  
  mapEmbedUrl: z.string().url({ message: "Invalid URL for map embed" }).or(z.literal('')).optional().default('').describe("URL for the map iframe src, e.g. Google Maps"),

}).default({});

export type IndividualCentrePageContentType = z.infer<typeof IndividualCentrePageContentSchema>;
