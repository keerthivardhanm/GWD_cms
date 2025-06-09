
import { z } from 'zod';
import { FaqItemSchema } from './admissionsPageSchema'; // Direct import for use as a value

export const StringListItemSchema = z.object({
  value: z.string().optional().default('')
}).default({});
export type StringListItemType = z.infer<typeof StringListItemSchema>;


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
    highlights: z.array(StringListItemSchema).optional().default([]),
  }).optional().default({ highlights: [] }),
  curriculumSection: z.object({
    yearWiseSubjects: z.object({
        year1: z.array(StringListItemSchema).optional().default([]).describe("Subjects for year 1"),
        year2: z.array(StringListItemSchema).optional().default([]).describe("Subjects for year 2"),
        year3: z.array(StringListItemSchema).optional().default([]).describe("Subjects for year 3"),
    }).optional().default({ year1: [], year2: [], year3: [] }),
  }).optional().default({ yearWiseSubjects: { year1: [], year2: [], year3: [] } }),
  eligibilityDuration: z.object({
    eligibility: z.string().optional().default(''),
    duration: z.string().optional().default(''),
  }).optional().default({}),
  careerOpportunities: z.object({
    careers: z.array(StringListItemSchema).optional().default([]),
  }).optional().default({ careers: [] }),
  programFaqs: z.object({
    faqs: z.array(FaqItemSchema).optional().default([]), // Now FaqItemSchema is correctly in scope
  }).optional().default({ faqs: [] }),
}).default({});

export type IndividualProgramPageContentType = z.infer<typeof IndividualProgramPageContentSchema>;
