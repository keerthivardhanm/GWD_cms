
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function SchemaBuilderPageRemoved() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Schema Builder"
        description="This feature has been removed."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Feature Not Available
          </CardTitle>
          <CardDescription>
            The Schema Builder functionality is no longer part of this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page has been disabled.</p>
        </CardContent>
      </Card>
    </div>
  );
}
