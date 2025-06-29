
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
  prompt: `You are an expert system designer who creates content management system (CMS) schemas. Your task is to analyze the provided JSON content and generate a valid schema object that can be used to represent this data.

The JSON can be in one of two formats:
1.  **Flat Object**: A simple dictionary where each key is a field name and the value is a string describing the data type.
2.  **Nested Array Object**: An object with a single key, where the value is an array containing a sample object. This represents a list of items, and you should create a 'repeater' field for it.

Follow these rules precisely:
1.  **Schema Name and Description**:
    *   For a **Flat Object**, infer a descriptive 'name' and 'description' from the field names (e.g., "title", "author" -> "Blog Post").
    *   For a **Nested Array Object** (e.g., \`{"jobs": [...]}\`), use the array's key ("jobs") to create the schema name (e.g., "Jobs").
2.  **Slug**: Create a URL-friendly 'slug' from the schema name. It must be lowercase, alphanumeric, with words separated by hyphens (e.g., 'blog-post', 'jobs').
3.  **Field Generation**:
    *   For a **Flat Object**, create a 'fields' array where each item corresponds to a key-value pair in the JSON.
    *   For a **Nested Array Object**, create a 'fields' array with a *single field* of type \`repeater\`. The \`name\` and \`label\` of this repeater should come from the JSON key (e.g., "jobs"). The sub-fields of this repeater should be generated from the keys of the first object inside the array.
4.  **Field Filtering**: **Crucially, ignore any JSON keys that end with \`_class\`, \`_icon_class\`, or contain the word 'button'.** These are presentational details and should not be part of the data schema.
5.  **Field Naming**: For each field or sub-field, the 'name' must be the original JSON key.
6.  **Field Labels**: The 'label' should be a human-readable version of the key (e.g., "job_title" becomes "Job Title").
7.  **Field Types**: Determine the 'type' for each field by interpreting its string value from the JSON:
    *   If the value is \`string (URL)\` or \`string (Image URL)\`, the type should be \`image_url\`.
    *   If the value is \`string\` and the key suggests long content (e.g., \`description\`, \`bio\`, \`content\`), the type should be \`textarea\`. Otherwise, it should be \`text\`.
    *   If the value is \`number\`, the type should be \`number\`.
    *   If the value is \`boolean\`, the type should be \`boolean\`.
8.  **Required**: Set 'required' to \`false\` for all fields by default.
9.  **IDs**: Ensure every field and sub-field has a unique 'id' generated using a UUID-like random string.

Analyze the following JSON content and generate the corresponding schema:
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
