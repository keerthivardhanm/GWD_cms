
import { z } from 'zod';

const ProgramTabSchema = z.object({
    title: z.string().optional(),
    anchorLink: z.string().optional().describe("e.g., #category-slug"),
}).default({});

const ProgramCardSchema = z.object({
    title: z.string().optional(),
    imgSrc: z.string().url().optional(),
    alt: z.string().optional(),
    description: z.string().optional(),
    duration: z.string().optional(),
    btnLink: z.string().optional().describe("Relative or absolute URL to the program detail page"),
}).default({});

export const ProgramsListingPageContentSchema = z.object({
    programTabs: z.object({
        tabs: z.array(ProgramTabSchema).optional().default([]),
    }).optional().default({ tabs: [] }),
    programCards: z.object({ // This might be a general pool of programs or structured by category later
        programs: z.array(ProgramCardSchema).optional().default([]),
    }).optional().default({ programs: [] }),
}).default({});

export type ProgramsListingPageContentType = z.infer<typeof ProgramsListingPageContentSchema>;

    