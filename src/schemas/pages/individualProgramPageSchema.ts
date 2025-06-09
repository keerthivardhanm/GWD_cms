
import { z } from 'zod';

const FaqItemSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
}).default({});

export const IndividualProgramPageContentSchema = z.object({
  programHero: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    heroImage: z.string().url().optional(),
    btnText: z.string().optional(),
    btnLink: z.string().url().optional(),
  }).optional().default({}),
  overviewSection: z.object({
    introText: z.string().optional(),
    highlights: z.array(z.string()).optional().default([]),
  }).optional().default({ highlights: [] }),
  curriculumSection: z.object({
    yearWiseSubjects: z.object({
        year1: z.array(z.string()).optional().default([]),
        year2: z.array(z.string()).optional().default([]),
        year3: z.array(z.string()).optional().default([]),
        // Add more years if needed
    }).optional().default({ year1: [], year2: [], year3: [] }),
  }).optional().default({ yearWiseSubjects: { year1: [], year2: [], year3: [] } }),
  eligibilityDuration: z.object({
    eligibility: z.string().optional(),
    duration: z.string().optional(),
  }).optional().default({}),
  careerOpportunities: z.object({
    careers: z.array(z.string()).optional().default([]),
  }).optional().default({ careers: [] }),
  programFaqs: z.object({
    faqs: z.array(FaqItemSchema).optional().default([]),
  }).optional().default({ faqs: [] }),
}).default({});

export type IndividualProgramPageContentType = z.infer<typeof IndividualProgramPageContentSchema>;

    