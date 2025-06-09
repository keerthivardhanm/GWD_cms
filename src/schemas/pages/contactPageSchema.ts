
import { z } from 'zod';

export const ContactPageContentSchema = z.object({
  contactForm: z.object({ // These are labels/placeholders for the form fields
    name: z.string().optional().describe("Label for the name field"),
    email: z.string().optional().describe("Label for the email field"),
    phone: z.string().optional().describe("Label for the phone field"),
    message: z.string().optional().describe("Label for the message field"),
    submitButtonText: z.string().optional().describe("Text for the submit button"),
  }).optional().default({}),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    mapEmbed: z.string().url().optional().describe("URL for the map iframe src"),
  }).optional().default({}),
}).default({});

export type ContactPageContentType = z.infer<typeof ContactPageContentSchema>;

    