
'use server';
/**
 * @fileOverview A Genkit flow to summarize a note and suggest a title.
 *
 * - summarizeNote - A function that generates a summary and title for a given note.
 * - SummarizeNoteInput - The input type for the summarizeNote function.
 * - SummarizeNoteOutput - The return type for the summarizeNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNoteInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to be summarized.'),
});
export type SummarizeNoteInput = z.infer<typeof SummarizeNoteInputSchema>;

const SummarizeNoteOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the note.'),
  title: z.string().describe('A catchy title suggested for the note.'),
});
export type SummarizeNoteOutput = z.infer<typeof SummarizeNoteOutputSchema>;

export async function summarizeNote(input: SummarizeNoteInput): Promise<SummarizeNoteOutput> {
  return summarizeNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNotePrompt',
  input: {schema: SummarizeNoteInputSchema},
  output: {schema: SummarizeNoteOutputSchema},
  prompt: `You are a helpful assistant. Given the following note content, please generate:
1. A concise summary of the note (around 1-2 sentences).
2. A short, catchy title for the note (3-5 words).

Note Content:
{{{noteContent}}}

Please return your response in the specified JSON format.
`,
});

const summarizeNoteFlow = ai.defineFlow(
  {
    name: 'summarizeNoteFlow',
    inputSchema: SummarizeNoteInputSchema,
    outputSchema: SummarizeNoteOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to get a response from the AI model.");
    }
    return output;
  }
);
