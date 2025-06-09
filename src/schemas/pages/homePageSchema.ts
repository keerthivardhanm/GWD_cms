
import { z } from 'zod';

const HeroSlideSchema = z.object({
  imgSrc: z.string().url().optional(),
  alt: z.string().optional(),
  heading: z.string().optional(),
  paragraph: z.string().optional(),
  btnText: z.string().optional(),
  btnLink: z.string().url().optional(),
}).default({});

const WhyChooseFeatureSchema = z.object({
  iconSrc: z.string().optional(), // Could be an icon name or path
  title: z.string().optional(),
  description: z.string().optional(),
}).default({});

const ProgramItemSchema = z.object({
  imgSrc: z.string().url().optional(),
  alt: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  btnLink: z.string().url().optional(),
}).default({});

const CounterItemSchema = z.object({
  value: z.union([z.number(), z.string()]).optional(),
  label: z.string().optional(),
}).default({});

const CentreItemSchema = z.object({
  imgSrc: z.string().url().optional(),
  alt: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  btnLink: z.string().url().optional(),
}).default({});

const AccreditationLogoSchema = z.object({
  imgSrc: z.string().url().optional(),
  alt: z.string().optional(),
  name: z.string().optional(),
}).default({});

const GlobalPartnerSchema = z.object({
  imgSrc: z.string().url().optional(),
  alt: z.string().optional(),
  name: z.string().optional(),
}).default({});

export const HomePageContentSchema = z.object({
  heroSection: z.object({
    slides: z.array(HeroSlideSchema).optional().default([]),
  }).optional().default({ slides: [] }),
  whyChoose: z.object({
    introHeading: z.string().optional(),
    introParagraph: z.string().optional(),
    features: z.array(WhyChooseFeatureSchema).optional().default([]),
  }).optional().default({ features: [] }),
  programsList: z.object({
    sectionHeading: z.string().optional(),
    sectionIntro: z.string().optional(),
    programs: z.array(ProgramItemSchema).optional().default([]),
  }).optional().default({ programs: [] }),
  counters: z.object({
    counters: z.array(CounterItemSchema).optional().default([]),
  }).optional().default({ counters: [] }),
  centres: z.object({
    sectionHeading: z.string().optional(),
    centres: z.array(CentreItemSchema).optional().default([]),
  }).optional().default({ centres: [] }),
  accreditations: z.object({
    logos: z.array(AccreditationLogoSchema).optional().default([]),
  }).optional().default({ logos: [] }),
  globalPartnerships: z.object({
    sectionHeading: z.string().optional(),
    partners: z.array(GlobalPartnerSchema).optional().default([]),
  }).optional().default({ partners: [] }),
  ctaSection: z.object({
    heading: z.string().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().url().optional(),
  }).optional().default({}),
}).default({});

export type HomePageContentType = z.infer<typeof HomePageContentSchema>;
