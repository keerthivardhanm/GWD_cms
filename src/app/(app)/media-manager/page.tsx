
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function MediaManagerPageRemoved() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Manager"
        description="This feature has been removed."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Feature Not Available
          </CardTitle>
          <CardDescription>
            The Media Manager functionality is no longer part of this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>If you need to manage media, please consider using an external storage solution and referencing URLs directly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
