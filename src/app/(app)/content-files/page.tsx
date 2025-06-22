
"use client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ContentFilesPageRemoved() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Files"
        description="This feature has been superseded."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Feature Location Changed
          </CardTitle>
          <CardDescription>
            The concept of "Content Files" or "Modules" has been integrated into other parts of the CMS for a better workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            To define the structure of your content (e.g., fields for a blog post), please use the{' '}
            <Link href="/schema-builder" className="font-medium text-primary underline hover:no-underline">
              Schema Builder
            </Link>.
          </p>
          <p>
             To create instances of content using those structures (like writing an actual blog post), please use the{' '}
             <Link href="/pages" className="font-medium text-primary underline hover:no-underline">
              Pages
            </Link> section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
