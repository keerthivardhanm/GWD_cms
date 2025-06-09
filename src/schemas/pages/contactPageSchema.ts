
import { z } from 'zod';

export const ContactPageContentSchema = z.object({
  contactForm: z.object({ // These are labels/placeholders for the form fields
    name: z.string().optional().default('').describe("Label for the name field"),
    email: z.string().optional().default('').describe("Label for the email field"),
    phone: z.string().optional().default('').describe("Label for the phone field"),
    message: z.string().optional().default('').describe("Label for the message field"),
    submitButtonText: z.string().optional().default('').describe("Text for the submit button"),
  }).optional().default({}),
  contactInfo: z.object({
    phone: z.string().optional().default(''),
    email: z.string().email({ message: "Invalid email format." }).or(z.literal('')).optional().default(''),
    address: z.string().optional().default(''),
    mapEmbed: z.string().url({ message: "Invalid URL format for map embed." }).or(z.literal('')).optional().default('').describe("URL for the map iframe src"),
  }).optional().default({}),
}).default({});

export type ContactPageContentType = z.infer<typeof ContactPageContentSchema>;
