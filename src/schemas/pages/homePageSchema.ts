
import { z } from 'zod';

export const HeroButtonSchema = z.object({
  text: z.string().optional().default(''),
  link: z.string().optional().default(''), // Allow any string
}).default({});
export type HeroButtonType = z.infer<typeof HeroButtonSchema>;

export const HeroSlideSchema = z.object({
  imgSrc: z.string().or(z.literal('')).optional().default(''), // Allow any string
  alt: z.string().optional().default(''),
  heading: z.string().optional().default(''),
  paragraph: z.string().optional().default(''),
  buttons: z.array(HeroButtonSchema).min(1, "At least one button is required").max(3, "Maximum of 3 buttons allowed").optional().default([HeroButtonSchema.parse({})]),
}).default({});
export type HeroSlideType = z.infer<typeof HeroSlideSchema>;

export const WhyChooseFeatureSchema = z.object({
  iconSrc: z.string().optional().default(''),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
}).default({});
export type WhyChooseFeatureType = z.infer<typeof WhyChooseFeatureSchema>;

export const ProgramItemSchema = z.object({
  imgSrc: z.string().or(z.literal('')).optional().default(''), // Allow any string
  alt: z.string().optional().default(''),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  btnLink: z.string().or(z.literal('')).optional().default(''), // Allow any string
}).default({});
export type ProgramItemType = z.infer<typeof ProgramItemSchema>;

export const CounterItemSchema = z.object({
  value: z.union([z.number(), z.string()]).optional().default(''),
  label: z.string().optional().default(''),
}).default({});
export type CounterItemType = z.infer<typeof CounterItemSchema>;

export const CentreItemSchema = z.object({
  imgSrc: z.string().or(z.literal('')).optional().default(''), // Allow any string
  alt: z.string().optional().default(''),
  name: z.string().optional().default(''),
  description: z.string().optional().default(''),
  btnLink: z.string().or(z.literal('')).optional().default(''), // Allow any string
}).default({});
export type CentreItemType = z.infer<typeof CentreItemSchema>;

export const AccreditationLogoSchema = z.object({
  imgSrc: z.string().or(z.literal('')).optional().default(''), // Allow any string
  alt: z.string().optional().default(''),
  name: z.string().optional().default(''),
}).default({});
export type AccreditationLogoType = z.infer<typeof AccreditationLogoSchema>;

export const GlobalPartnerSchema = z.object({
  imgSrc: z.string().or(z.literal('')).optional().default(''), // Allow any string
  alt: z.string().optional().default(''),
  name: z.string().optional().default(''),
  description: z.string().optional().default(''),
}).default({});
export type GlobalPartnerType = z.infer<typeof GlobalPartnerSchema>;

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
    buttonLink: z.string().or(z.literal('')).optional().default(''), // Allow any string
  }).optional().default({}),
}).default({});

export type HomePageContentType = z.infer<typeof HomePageContentSchema>;
