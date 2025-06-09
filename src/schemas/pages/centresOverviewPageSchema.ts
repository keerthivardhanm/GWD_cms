
import { z } from 'zod';

const CentreCardSchema = z.object({
    name: z.string().optional().default(''),
    imgSrc: z.string().url({ message: "Invalid URL format for image source." }).or(z.literal('')).optional().default(''),
    alt: z.string().optional().default(''),
    description: z.string().optional().default(''),
    btnLink: z.string().optional().default('').describe("Relative or absolute URL to the individual centre page"),
}).default({});

export const CentresOverviewPageContentSchema = z.object({
    centreCards: z.object({
        centres: z.array(CentreCardSchema).optional().default([]),
    }).optional().default({ centres: [] }),
}).default({});

export type CentresOverviewPageContentType = z.infer<typeof CentresOverviewPageContentSchema>;
