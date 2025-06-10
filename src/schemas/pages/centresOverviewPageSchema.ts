
import { z } from 'zod';

// For the facilities list within each centre
export const CentreFacilitySchema = z.object({
  iconClass: z.string().optional().default('').describe("Font Awesome class or Lucide icon name, e.g., 'fas fa-flask' or 'lucide:FlaskConical'"),
  text: z.string().optional().default(''),
}).default({});
export type CentreFacilityType = z.infer<typeof CentreFacilitySchema>;

// For each centre item in the list
export const CentreListItemSchema = z.object({
  imageSrc: z.string().url({ message: "Invalid image URL" }).or(z.literal('')).optional().default(''),
  imageAlt: z.string().optional().default(''),
  name: z.string().optional().default(''), // Removed .min(1)
  description: z.string().optional().default(''),
  address: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email({ message: "Invalid email format" }).or(z.literal('')).optional().default(''),
  facilitiesHeading: z.string().optional().default('Key Facilities'),
  facilities: z.array(CentreFacilitySchema).optional().default([]),
  detailsButtonText: z.string().optional().default('View Details'),
  detailsButtonLink: z.string().optional().default('').describe("Slug for the individual centre page, e.g., /centres/chennai"),
}).default({});
export type CentreListItemType = z.infer<typeof CentreListItemSchema>;

// Top-level schema for the "Centres Overview" page content
export const CentresOverviewPageContentSchema = z.object({
  heroSection: z.object({
    heading: z.string().optional().default('Our Centres'),
    subheading: z.string().optional().default('Experience excellence in healthcare education at our state-of-the-art facilities'),
  }).optional().default({ heading: 'Our Centres', subheading: 'Experience excellence in healthcare education at our state-of-the-art facilities' }),
  centresList: z.array(CentreListItemSchema).optional().default([]),
}).default({});

export type CentresOverviewPageContentType = z.infer<typeof CentresOverviewPageContentSchema>;

    