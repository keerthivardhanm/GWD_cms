
import { z } from 'zod';

const ApplicationStepSchema = z.object({
  number: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
}).default({});

const FaqItemSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
}).default({});

export const AdmissionsPageContentSchema = z.object({
  applicationSteps: z.object({
    mainHeading: z.string().optional(),
    steps: z.array(ApplicationStepSchema).optional().default([]),
  }).optional().default({ steps: [] }),
  admissionsFaq: z.object({
    sectionHeading: z.string().optional(),
    faqs: z.array(FaqItemSchema).optional().default([]),
  }).optional().default({ faqs: [] }),
  eligibilitySection: z.object({
    eligibilityCriteria: z.string().optional(),
    durationInfo: z.string().optional(),
    feeStructure: z.string().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().url().optional(),
  }).optional().default({}),
}).default({});

export type AdmissionsPageContentType = z.infer<typeof AdmissionsPageContentSchema>;

    