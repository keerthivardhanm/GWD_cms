
import { z } from 'zod';

const HeroSlideSchema = z.object({
  imgSrc: z.string().url({ message: "Invalid URL format for image source." }).or(z.literal('')).optional().default(''),
  alt: z.string().optional().default(''),
  heading: z.string().optional().default(''),
  paragraph: z.string().optional().default(''),
  btnText: z.string().optional().default(''),
  btnLink: z.string().url({ message: "Invalid URL format for button link." }).or(z.literal('')).optional().default(''),
}).default({});

const WhyChooseFeatureSchema = z.object({
  iconSrc: z.string().optional().default(''), // Could be an icon name or path
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
}).default({});

const ProgramItemSchema = z.object({
  imgSrc: z.string().url({ message: "Invalid URL format for image source." }).or(z.literal('')).optional().default(''),
  alt: z.string().optional().default(''),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  btnLink: z.string().url({ message: "Invalid URL format for button link." }).or(z.literal('')).optional().default(''),
}).default({});

const CounterItemSchema = z.object({
  value: z.union([z.number(), z.string()]).optional().default(''),
  label: z.string().optional().default(''),
}).default({});

const CentreItemSchema = z.object({
  imgSrc: z.string().url({ message: "Invalid URL format for image source." }).or(z.literal('')).optional().default(''),
  alt: z.string().optional().default(''),
  name: z.string().optional().default(''),
  description: z.string().optional().default(''),
  btnLink: z.string().url({ message: "Invalid URL format for button link." }).or(z.literal('')).optional().default(''),
}).default({});

const AccreditationLogoSchema = z.object({
  imgSrc: z.string().url({ message: "Invalid URL format for image source." }).or(z.literal('')).optional().default(''),
  alt: z.string().optional().default(''),
  name: z.string().optional().default(''),
}).default({});

const GlobalPartnerSchema = z.object({
  imgSrc: z.string().url({ message: "Invalid URL format for image source." }).or(z.literal('')).optional().default(''),
  alt: z.string().optional().default(''),
  name: z.string().optional().default(''),
}).default({});

export const HomePageContentSchema = z.object({
  heroSection: z.object({
    slides: z.array(HeroSlideSchema).optional().default([]),
  }).optional().default({ slides: [] }),
  whyChoose: z.object({
    introHeading: z.string().optional().default(''),
    introParagraph: z.string().optional().default(''),
    features: z.array(WhyChooseFeatureSchema).optional().default([]),
  }).optional().default({ features: [] }),
  programsList: z.object({
    sectionHeading: z.string().optional().default(''),
    sectionIntro: z.string().optional().default(''),
    programs: z.array(ProgramItemSchema).optional().default([]),
  }).optional().default({ programs: [] }),
  counters: z.object({
    counters: z.array(CounterItemSchema).optional().default([]),
  }).optional().default({ counters: [] }),
  centres: z.object({
    sectionHeading: z.string().optional().default(''),
    centres: z.array(CentreItemSchema).optional().default([]),
  }).optional().default({ centres: [] }),
  accreditations: z.object({
    logos: z.array(AccreditationLogoSchema).optional().default([]),
  }).optional().default({ logos: [] }),
  globalPartnerships: z.object({
    sectionHeading: z.string().optional().default(''),
    partners: z.array(GlobalPartnerSchema).optional().default([]),
  }).optional().default({ partners: [] }),
  ctaSection: z.object({
    heading: z.string().optional().default(''),
    buttonText: z.string().optional().default(''),
    buttonLink: z.string().url({ message: "Invalid URL format for CTA button link." }).or(z.literal('')).optional().default(''),
  }).optional().default({}),
}).default({});

export type HomePageContentType = z.infer<typeof HomePageContentSchema>;
