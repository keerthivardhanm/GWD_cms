import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: "AIzaSyBL-qIyu_doj1un-9_6zPZaAD4QOVaNO9U" })
  ],
  model: 'googleai/gemini-1.5-flash-latest', // Updated to a valid and capable model
});
