
'use server';
/**
 * @fileOverview A Genkit flow to fetch Google Analytics data.
 *
 * - fetchGaData - Fetches key metrics from Google Analytics Data API.
 * - GaDataOutput - The return type for the fetchGaData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const GaDataOutputSchema = z.object({
  activeUsers: z.string().optional(),
  newUsers: z.string().optional(),
  screenPageViews: z.string().optional(),
  topPages: z.array(z.object({
    pagePath: z.string(),
    screenPageViews: z.string(),
  })).optional(),
  error: z.string().optional(),
});
export type GaDataOutput = z.infer<typeof GaDataOutputSchema>;

async function initializeGaClient() {
  const credentialsJsonString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;
  if (!credentialsJsonString) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING environment variable is not set.");
  }
  try {
    const credentials = JSON.parse(credentialsJsonString);
    return new BetaAnalyticsDataClient({ credentials });
  } catch (error) {
    console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING:", error);
    throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING format.");
  }
}


export async function fetchGaData(): Promise<GaDataOutput> {
  return fetchGaDataFlow();
}

const fetchGaDataFlow = ai.defineFlow(
  {
    name: 'fetchGaDataFlow',
    inputSchema: z.null(), // No input needed as propertyId comes from env
    outputSchema: GaDataOutputSchema,
  },
  async () => {
    const propertyId = process.env.GA_PROPERTY_ID;
    if (!propertyId) {
      return { error: "GA_PROPERTY_ID environment variable is not set." };
    }

    let analyticsDataClient;
    try {
      analyticsDataClient = await initializeGaClient();
    } catch (e: any) {
      return { error: `Failed to initialize GA client: ${e.message}` };
    }
    
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(sevenDaysAgo);
    const endDate = formatDate(today);

    try {
      // Active Users
      const [activeUsersResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'activeUsers' }],
      });
      const activeUsers = activeUsersResponse.rows?.[0]?.metricValues?.[0]?.value || '0';

      // New Users
      const [newUsersResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'newUsers' }],
      });
      const newUsers = newUsersResponse.rows?.[0]?.metricValues?.[0]?.value || '0';
      
      // Screen Page Views
      const [screenPageViewsResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'screenPageViews' }],
      });
      const screenPageViews = screenPageViewsResponse.rows?.[0]?.metricValues?.[0]?.value || '0';

      // Top Pages
      const [topPagesResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      });

      const topPages = topPagesResponse.rows?.map(row => ({
        pagePath: row.dimensionValues?.[0]?.value || 'N/A',
        screenPageViews: row.metricValues?.[0]?.value || '0',
      })) || [];
      
      return {
        activeUsers,
        newUsers,
        screenPageViews,
        topPages,
      };

    } catch (error: any) {
      console.error('Error fetching GA data:', error);
      return { error: `Failed to fetch GA data: ${error.message}` };
    }
  }
);
