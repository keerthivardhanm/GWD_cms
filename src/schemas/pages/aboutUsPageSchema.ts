
import { z } from 'zod';

const TimelineEventSchema = z.object({
  year: z.string().optional().default(''),
  event: z.string().optional().default(''),
}).default({});

export const AboutUsPageContentSchema = z.object({
  banner: z.object({
    heading: z.string().optional().default(''),
    subheading: z.string().optional().default(''),
    backgroundImage: z.string().url({ message: "Invalid URL format for background image." }).or(z.literal('')).optional().default(''),
  }).optional().default({}),
  visionMission: z.object({
    visionText: z.string().optional().default(''),
    missionPoints: z.array(z.string().optional().default('')).optional().default([]),
  }).optional().default({ missionPoints: [] }),
  timelineSection: z.object({
    events: z.array(TimelineEventSchema).optional().default([]),
  }).optional().default({ events: [] }),
}).default({});

export type AboutUsPageContentType = z.infer<typeof AboutUsPageContentSchema>;
