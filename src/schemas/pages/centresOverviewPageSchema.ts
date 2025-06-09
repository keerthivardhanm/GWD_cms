
import { z } from 'zod';

const CentreCardSchema = z.object({
    name: z.string().optional(),
    imgSrc: z.string().url().optional(),
    alt: z.string().optional(),
    description: z.string().optional(),
    btnLink: z.string().optional().describe("Relative or absolute URL to the individual centre page"),
}).default({});

export const CentresOverviewPageContentSchema = z.object({
    centreCards: z.object({
        centres: z.array(CentreCardSchema).optional().default([]),
    }).optional().default({ centres: [] }),
}).default({});

export type CentresOverviewPageContentType = z.infer<typeof CentresOverviewPageContentSchema>;

    