
import { z } from 'zod';

// Define and export the element schema
export const CentreCardSchema = z.object({
    name: z.string().optional().default(''),
    imgSrc: z.string().url({ message: "Invalid URL format for image source." }).or(z.literal('')).optional().default(''),
    alt: z.string().optional().default(''),
    description: z.string().optional().default(''),
    btnLink: z.string().optional().default('').describe("Relative or absolute URL to the individual centre page"),
}); // Removed .default({}) here for the exported schema, so .parse({}) can be used on it

export const CentresOverviewPageContentSchema = z.object({
    centreCards: z.object({
        centres: z.array(CentreCardSchema).optional().default([]), // This now uses the exported CentreCardSchema
    }).optional().default({ centres: [] }),
}).default({});

export type CentresOverviewPageContentType = z.infer<typeof CentresOverviewPageContentSchema>;
