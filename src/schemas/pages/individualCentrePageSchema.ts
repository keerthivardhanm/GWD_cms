
import { z } from 'zod';

const CentreFeatureSchema = z.object({
    icon: z.string().optional().describe("e.g., lucide icon name like 'Wifi' or path to an SVG"),
    text: z.string().optional(),
}).default({});

export const IndividualCentrePageContentSchema = z.object({
    centreInfo: z.object({
        heading: z.string().optional(),
        paragraph: z.string().optional(),
        features: z.array(CentreFeatureSchema).optional().default([]),
    }).optional().default({ features: [] }),
    // You might add other sections like gallery, map, contact specific to this centre
}).default({});

export type IndividualCentrePageContentType = z.infer<typeof IndividualCentrePageContentSchema>;

    