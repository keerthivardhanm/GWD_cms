
import { z } from 'zod';

const TimelineEventSchema = z.object({
  year: z.string().optional(),
  event: z.string().optional(),
}).default({});

export const AboutUsPageContentSchema = z.object({
  banner: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    backgroundImage: z.string().url().optional(),
  }).optional().default({}),
  visionMission: z.object({
    visionText: z.string().optional(),
    missionPoints: z.array(z.string()).optional().default([]),
  }).optional().default({ missionPoints: [] }),
  timelineSection: z.object({
    events: z.array(TimelineEventSchema).optional().default([]),
  }).optional().default({ events: [] }),
}).default({});

export type AboutUsPageContentType = z.infer<typeof AboutUsPageContentSchema>;
