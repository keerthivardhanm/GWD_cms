import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote } from "lucide-react";

export function KeepNotes() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Keep Notes
        </CardTitle>
        <CardDescription>Jot down quick tasks or reminders for yourself.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Textarea placeholder="Type your note here..." className="min-h-[150px] resize-none" />
          <Button type="submit" className="w-full sm:w-auto">Save Note</Button>
        </form>
      </CardContent>
    </Card>
  );
}
