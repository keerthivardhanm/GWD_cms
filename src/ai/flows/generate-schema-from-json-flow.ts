
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
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: GenerateSchemaInputSchema },
  output: { schema: contentSchemaFormSchema },
  prompt: `You are an expert system designer who creates content management system (CMS) schemas. Your task is to analyze the provided JSON content, which describes the desired schema structure, and generate a valid schema object that can be used to represent this data.

The input JSON is a dictionary where each key is the desired field name and each value is a string describing the data type for that field.

Follow these rules precisely:
1.  **Schema Name and Description**: Infer a descriptive 'name' and 'description' for the schema based on the overall structure and field names provided in the JSON. For example, if fields are "title", "author", "publish_date", a good name would be "Blog Post".
2.  **Slug**: Create a URL-friendly 'slug' from the schema name. It must be lowercase, alphanumeric, with words separated by hyphens (e.g., 'blog-post').
3.  **Fields**: Iterate through the key-value pairs in the input JSON to create the 'fields' array in the output schema.
4.  **Field Naming**: For each field, the 'name' must be the original JSON key.
5.  **Field Labels**: The 'label' should be a human-readable version of the key (e.g., "role" becomes "Role", "experience" becomes "Experience").
6.  **Field Types**: Determine the 'type' for each field by interpreting the string value from the input JSON:
    *   If the value is \`string (URL)\` or \`string (Image URL)\`, the type should be \`image_url\`.
    *   If the value is \`string\` and the key suggests long content (e.g., \`description\`, \`bio\`, \`content\`, \`details\`), the type should be \`textarea\`.
    *   If the value is \`string\`, the type should be \`text\`.
    *   If the value is \`number\`, the type should be \`number\`.
    *   If the value is \`boolean\`, the type should be \`boolean\`.
    *   The model does not yet support \`repeater\` types from this JSON format.
7.  **Required**: Set 'required' to false for all fields by default.
8.  **IDs**: Ensure every field has a unique 'id' generated using a UUID-like random string.

Analyze the following JSON content which defines the schema structure:
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
