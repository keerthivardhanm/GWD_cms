
import { z } from 'zod';

export const EnquiryFormFieldSchema = z.object({
    label: z.string().optional(),
    name: z.string().optional().describe("Unique key for the field, e.g., 'fullName'"),
    inputType: z.enum(['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio']).optional().default('text'),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional().describe("For select, radio, or checkbox groups"), // For select, radio, checkbox groups
    required: z.boolean().optional().default(false),
}).default({});
export type EnquiryFormFieldType = z.infer<typeof EnquiryFormFieldSchema>;


export const EnquiryPageContentSchema = z.object({
    enquiryForm: z.object({
        formTitle: z.string().optional().default("Enquiry Form"),
        submitButtonText: z.string().optional().default("Submit Enquiry"),
        fields: z.array(EnquiryFormFieldSchema).optional().default([]),
    }).optional().default({ fields: [] }),
}).default({});

export type EnquiryPageContentType = z.infer<typeof EnquiryPageContentSchema>;
