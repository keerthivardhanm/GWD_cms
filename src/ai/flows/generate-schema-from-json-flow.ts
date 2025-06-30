
'use server';
/**
 * @fileOverview An AI flow to generate a content schema from an HTML snippet.
 * This has been updated from the previous JSON-based generation to be more powerful.
 *
 * - generateSchemaFromHtml - A function that handles the schema generation process from HTML.
 * - GenerateSchemaInput - The input type for the generateSchemaFromHtml function.
 * - GenerateSchemaOutput - The return type for the generateSchemaFromHtml function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { contentSchemaFormSchema } from '@/components/forms/SchemaForm';

const GenerateSchemaInputSchema = z.object({
  htmlContent: z.string().describe('An HTML snippet containing a list of repeating elements (e.g., a list of products, jobs, or articles).'),
});
export type GenerateSchemaInput = z.infer<typeof GenerateSchemaInputSchema>;

export type GenerateSchemaOutput = z.infer<typeof contentSchemaFormSchema>;


export async function generateSchemaFromHtml(input: GenerateSchemaInput): Promise<GenerateSchemaOutput> {
  return generateSchemaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSchemaFromHtmlPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: GenerateSchemaInputSchema },
  output: { schema: contentSchemaFormSchema },
  prompt: `You are an expert CMS architect who specializes in reverse-engineering HTML to create structured content schemas. Your task is to analyze the provided HTML snippet and generate a comprehensive schema object that can be used to dynamically manage its content in a headless CMS.

Follow these rules with extreme precision:

1.  **Identify the Primary Repeater**: Analyze the HTML to find the main repeating element that represents a single item in a list (e.g., a \`div.job-bar\`, an \`li.product-card\`). All sub-fields will be based on the contents of this single repeating element.

2.  **Schema Name and Slug**:
    *   Infer a descriptive 'name' for the entire schema from the context of the HTML (e.g., "Jobs Listing", "Product Catalog").
    *   Create a URL-friendly 'slug' from the schema name (e.g., 'jobs-listing', 'product-catalog').

3.  **Create a Single Repeater Field**:
    *   The top-level \`fields\` array of the schema must contain exactly ONE field.
    *   This field's type must be \`repeater\`.
    *   The \`name\` of this repeater field should be a plural version of the item it contains (e.g., "jobs", "products", "articles").
    *   The \`label\` should be a human-readable version of the name (e.g., "Jobs", "Products").

4.  **Extract All Sub-Fields for the Repeater**:
    *   Carefully examine the FIRST instance of the repeating element and create a sub-field for EVERY piece of data. Do not omit any details.
    *   **Source from \`data-*\` attributes**: If an element has a \`data-job\` or similar attribute containing a JSON object, create a sub-field for EACH key inside that JSON object. For example, \`data-job='{"title":"Radiographer", "desc":"..."}'\` must result in sub-fields named \`title\` and \`desc\`.
    *   **Source from text content**: Extract text from elements like \`<span>\` or \`<h2>\`. Use the element's class or context to create a logical field name. For example, \`<span class="job-role">Radiographer</span>\` should become a sub-field named \`job_role\`.
    *   **Source from attributes**: Extract data from attributes, such as the \`src\` of an \`<img>\` tag.
    *   **Capture ALL class names**: Create sub-fields to store CSS classes for styling. For example, \`<div class="job-bar">\` should result in a field like \`job_container_class\` with a default value of "job-bar". Similarly, \`<i class="fas fa-map-marker-alt">\` should create a field like \`location_icon_class\`. Be thorough.

5.  **Field Naming and Labeling**:
    *   The 'name' for each sub-field must be logical, lowercase, and use snake_case (e.g., \`job_title\`, \`image_url\`, \`icon_class\`).
    *   The 'label' should be a human-readable, Title Case version of the name (e.g., "Job Title", "Image URL").

6.  **Field Type Inference**:
    *   If a value is clearly a URL (especially for an image), set the 'type' to \`image_url\`.
    *   If a field is for a long piece of text (like a description), set the 'type' to \`textarea\`.
    *   If a value from a data attribute is a boolean (\`true\`/\`false\`), set the 'type' to \`boolean\`.
    *   For all other text-based content (including CSS classes), use the 'type' to \`text\`.

7.  **IDs and Defaults**:
    *   Ensure every field and sub-field has a unique 'id' (generate a random UUID-like string).
    *   Set 'required' to \`false\` for all fields.

Analyze the following HTML snippet and generate the corresponding schema. Be meticulous.
\`\`\`html
{{{htmlContent}}}
\`\`\`
  `,
});

const generateSchemaFlow = ai.defineFlow(
  {
    name: 'generateSchemaFromHtmlFlow',
    inputSchema: GenerateSchemaInputSchema,
    outputSchema: contentSchemaFormSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a valid schema from the HTML.');
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
