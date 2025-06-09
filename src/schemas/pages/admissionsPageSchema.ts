
import { z } from 'zod';

export const ApplicationStepSchema = z.object({
  number: z.string().optional().default(''),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
}).default({});
export type ApplicationStepType = z.infer<typeof ApplicationStepSchema>;

export const FaqItemSchema = z.object({ // Generic, can be reused
  question: z.string().optional().default(''),
  answer: z.string().optional().default(''),
}).default({});
export type FaqItemType = z.infer<typeof FaqItemSchema>;

export const AdmissionsPageContentSchema = z.object({
  applicationSteps: z.object({
    mainHeading: z.string().optional().default(''),
    steps: z.array(ApplicationStepSchema).optional().default([]),
  }).optional().default({ steps: [] }),
  admissionsFaq: z.object({
    sectionHeading: z.string().optional().default(''),
    faqs: z.array(FaqItemSchema).optional().default([]),
  }).optional().default({ faqs: [] }),
  eligibilitySection: z.object({
    eligibilityCriteria: z.string().optional().default(''),
    durationInfo: z.string().optional().default(''),
    feeStructure: z.string().optional().default(''),
    buttonText: z.string().optional().default(''),
    buttonLink: z.string().url({ message: "Invalid URL format for button link." }).or(z.literal('')).optional().default(''),
  }).optional().default({}),
}).default({});

export type AdmissionsPageContentType = z.infer<typeof AdmissionsPageContentSchema>;
