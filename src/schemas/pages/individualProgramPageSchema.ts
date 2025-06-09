
import { z } from 'zod';

const FaqItemSchema = z.object({
  question: z.string().optional().default(''),
  answer: z.string().optional().default(''),
}).default({});

export const IndividualProgramPageContentSchema = z.object({
  programHero: z.object({
    heading: z.string().optional().default(''),
    subheading: z.string().optional().default(''),
    heroImage: z.string().url({ message: "Invalid URL format for hero image." }).or(z.literal('')).optional().default(''),
    btnText: z.string().optional().default(''),
    btnLink: z.string().url({ message: "Invalid URL format for button link." }).or(z.literal('')).optional().default(''),
  }).optional().default({}),
  overviewSection: z.object({
    introText: z.string().optional().default(''),
    highlights: z.array(z.string().optional().default('')).optional().default([]),
  }).optional().default({ highlights: [] }),
  curriculumSection: z.object({
    yearWiseSubjects: z.object({
        year1: z.array(z.string().optional().default('')).optional().default([]),
        year2: z.array(z.string().optional().default('')).optional().default([]),
        year3: z.array(z.string().optional().default('')).optional().default([]),
        // Add more years if needed
    }).optional().default({ year1: [], year2: [], year3: [] }),
  }).optional().default({ yearWiseSubjects: { year1: [], year2: [], year3: [] } }),
  eligibilityDuration: z.object({
    eligibility: z.string().optional().default(''),
    duration: z.string().optional().default(''),
  }).optional().default({}),
  careerOpportunities: z.object({
    careers: z.array(z.string().optional().default('')).optional().default([]),
  }).optional().default({ careers: [] }),
  programFaqs: z.object({
    faqs: z.array(FaqItemSchema).optional().default([]),
  }).optional().default({ faqs: [] }),
}).default({});

export type IndividualProgramPageContentType = z.infer<typeof IndividualProgramPageContentSchema>;
