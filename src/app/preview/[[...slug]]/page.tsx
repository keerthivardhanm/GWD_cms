
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileJson } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PagePreviewProps {
  params: { slug?: string[] };
}

async function getPageData(slugSegments?: string[]): Promise<DocumentData | null> {
  let targetSlug = "home"; // Default to home
  if (slugSegments && slugSegments.length > 0) {
    targetSlug = slugSegments.join('/');
    // Handle case where preview might be called with just "home" as slug
    if (targetSlug === "home" && slugSegments.length === 1 && slugSegments[0] === "home") {
        // keep targetSlug as 'home'
    } else if (slugSegments.length === 1 && slugSegments[0] === "home") {
         // This condition is a bit redundant with the default but good for clarity
    }
  }

  try {
    const pagesRef = collection(db, 'pages');
    // Firestore query for slug. If slug is "home", it might be an empty string or "home" in DB
    // For simplicity, we assume 'home' pages have slug 'home' or their pageType is 'home' and slug is empty
    let q;
    if (targetSlug === 'home') {
        // Try finding by slug 'home' OR by pageType 'home' with empty/no slug
        // This part needs careful consideration of how homepage is uniquely identified.
        // For now, let's assume 'home' pages are identified by slug 'home'.
        q = query(pagesRef, where('slug', '==', 'home'));
    } else {
        q = query(pagesRef, where('slug', '==', targetSlug));
    }
    
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming slug is unique, take the first document
      return querySnapshot.docs[0].data();
    } else if (targetSlug === 'home') {
        // Fallback for homepage: try pageType 'home' if slug 'home' not found (e.g. if slug is empty in DB)
        const homeByTypeQuery = query(pagesRef, where('pageType', '==', 'home'), where('slug', 'in', ['', null])); // Check for empty or null slug
        const homeByTypeSnapshot = await getDocs(homeByTypeQuery);
        if(!homeByTypeSnapshot.empty) {
            return homeByTypeSnapshot.docs[0].data();
        }
    }
    return null;
  } catch (error) {
    console.error("Error fetching page data for preview:", error);
    return null;
  }
}

export default async function PagePreview({ params }: PagePreviewProps) {
  const pageData = await getPageData(params.slug);

  if (!pageData) {
    return (
      <div className="container mx-auto p-4 sm:p-8 min-h-screen flex flex-col items-center justify-center">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              The page with slug "{params.slug?.join('/') || 'home'}" could not be found or an error occurred.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 min-h-screen bg-slate-50">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <FileJson className="mr-3 h-6 w-6 text-primary" />
                Data Preview: {pageData.title || 'Untitled Page'}
              </CardTitle>
              <CardDescription>
                Slug: /{pageData.slug || '(homepage)'} <span className="mx-2 text-muted-foreground">&bull;</span> Type: <span className="capitalize">{pageData.pageType?.replace('-', ' ') || 'Generic'}</span>
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-amber-500 shrink-0" />
              <span>
                <strong>This is a data-only preview.</strong> It shows the raw content structure that would be available to your public-facing website.
                The actual visual appearance will depend on how your frontend components render this data.
              </span>
            </p>
          </div>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Page Content:</h2>
          <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-sm leading-relaxed">
            {JSON.stringify(pageData.content, null, 2)}
          </pre>
          
          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">Full Page Data (metadata + content):</h2>
           <pre className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 p-4 rounded-md overflow-x-auto text-sm leading-relaxed">
            {JSON.stringify(pageData, null, 2)}
          </pre>
        </CardContent>
      </Card>
       <footer className="text-center mt-8 text-xs text-muted-foreground">
        Preview generated on: {new Date().toLocaleString()}
      </footer>
    </div>
  );
}

// Optional: Add revalidate for ISR if needed, or keep as fully dynamic
// export const revalidate = 60; // Revalidate every 60 seconds
