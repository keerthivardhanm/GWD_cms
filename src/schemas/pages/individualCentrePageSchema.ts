
import { z } from 'zod';

export const CentreFeatureSchema = z.object({
    icon: z.string().optional().default('').describe("e.g., lucide icon name like 'Wifi' or path to an SVG"),
    text: z.string().optional().default(''),
}).default({});
// This .default({}) should ideally be on the field using this schema, not the schema itself if we want to .parse({}) for defaults
// However, for consistency with other schemas and current usage in PageForm which expects .parse({}) to work on the element schema,
// we might need to adjust how PageForm gets defaults or adjust all element schemas.
// For now, let's keep .default({}) on the element schema, and PageForm will .parse({}) on it.

export const IndividualCentrePageContentSchema = z.object({
    centreInfo: z.object({
        heading: z.string().optional().default(''),
        paragraph: z.string().optional().default(''),
        features: z.array(CentreFeatureSchema).optional().default([]),
    }).optional().default({ heading: '', paragraph: '', features: [] }),
    // You might add other sections like gallery, map, contact specific to this centre
}).default({});

export type IndividualCentrePageContentType = z.infer<typeof IndividualCentrePageContentSchema>;
export type CentreFeatureType = z.infer<typeof CentreFeatureSchema>; // Exporting type for completeness
