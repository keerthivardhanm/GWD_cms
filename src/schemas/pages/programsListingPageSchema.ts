
import { z } from 'zod';

export const ProgramTabSchema = z.object({
    title: z.string().optional().default(''),
    anchorLink: z.string().optional().default('').describe("e.g., #category-slug"),
}).default({});
export type ProgramTabType = z.infer<typeof ProgramTabSchema>;

export const ProgramCardSchema = z.object({
    title: z.string().optional().default(''),
    imgSrc: z.string().url({ message: "Invalid URL format for image source." }).or(z.literal('')).optional().default(''),
    alt: z.string().optional().default(''),
    description: z.string().optional().default(''),
    duration: z.string().optional().default(''),
    btnLink: z.string().optional().default('').describe("Relative or absolute URL to the program detail page"),
}).default({});
export type ProgramCardType = z.infer<typeof ProgramCardSchema>;

export const ProgramsListingPageContentSchema = z.object({
    programTabs: z.object({
        tabs: z.array(ProgramTabSchema).optional().default([]),
    }).optional().default({ tabs: [] }),
    programCards: z.object({ // This might be a general pool of programs or structured by category later
        programs: z.array(ProgramCardSchema).optional().default([]),
    }).optional().default({ programs: [] }),
}).default({});

export type ProgramsListingPageContentType = z.infer<typeof ProgramsListingPageContentSchema>;

