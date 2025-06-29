'use server';
/**
 * @fileOverview An AI flow to generate a content schema from a JSON object.
 *
 * - generateSchemaFromJson - A function that handles the schema generation process.
 * - GenerateSchemaInput - The input type for the generateSchemaFromJson function.
 * - GenerateSchemaOutput - The return type for the generateSchemaFromJson function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { contentSchemaFormSchema } from '@/components/forms/SchemaForm';

const GenerateSchemaInputSchema = z.object({
  jsonContent: z.string().describe('A JSON string representing the data structure to create a schema from.'),
});
export type GenerateSchemaInput = z.infer<typeof GenerateSchemaInputSchema>;

export type GenerateSchemaOutput = z.infer<typeof contentSchemaFormSchema>;


export async function generateSchemaFromJson(input: GenerateSchemaInput): Promise<GenerateSchemaOutput> {
  return generateSchemaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSchemaPrompt',
  input: { schema: GenerateSchemaInputSchema },
  output: { schema: contentSchemaFormSchema },
  prompt: `You are an expert system designer who creates content management system (CMS) schemas. Your task is to analyze the provided JSON content and generate a valid schema object that can be used to represent this data.

  Follow these rules precisely:
  1.  **Schema Name and Description**: Infer a descriptive 'name' and 'description' for the schema based on the JSON content.
  2.  **Slug**: Create a URL-friendly 'slug' from the schema name. It must be lowercase, alphanumeric, with words separated by hyphens (e.g., 'blog-post').
  3.  **Fields**: Analyze the keys in the JSON object to create the 'fields' array.
  4.  **Field Naming**: For each field, the 'name' must be the original JSON key, converted to snake_case if it isn't already (e.g., "userName" becomes "user_name").
  5.  **Field Labels**: The 'label' should be a human-readable version of the key (e.g., "user_name" becomes "User Name").
  6.  **Field Types**: Infer the 'type' for each field based on its value:
      *   String values that look like long text should be 'textarea'.
      *   String values that look like URLs (especially for images) should be 'image_url'.
      *   Other string values should be 'text'.
      *   Number values should be 'number'.
      *   Boolean values should be 'boolean'.
      *   An array of objects should be a 'repeater' type. You MUST recursively define the 'fields' for the objects inside the repeater array.
      *   Do NOT use a 'repeater' for an array of simple strings or numbers; this is not supported.
  7.  **Required**: Set 'required' to false for all fields.
  8.  **IDs**: Ensure every field, including sub-fields within repeaters, has a unique 'id' generated using a UUID-like random string.

  Analyze the following JSON content:
  \`\`\`json
  {{{jsonContent}}}
  \`\`\`
  `,
});

const generateSchemaFlow = ai.defineFlow(
  {
    name: 'generateSchemaFlow',
    inputSchema: GenerateSchemaInputSchema,
    outputSchema: contentSchemaFormSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a valid schema.');
    }
    // Ensure all fields and subfields have a unique ID, as the model might forget.
    const ensureIds = (fields: any[]): any[] => {
        return fields.map(field => {
            const newField = { ...field, id: field.id || crypto.randomUUID() };
            if (newField.type === 'repeater' && newField.fields) {
                newField.fields = ensureIds(newField.fields);
            }
            return newField;
        });
    }
    output.fields = ensureIds(output.fields);
    return output;
  }
);
