
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, type LucideIcon } from "lucide-react"; // Make sure LucideIcon is typed if used

// Export this interface if used by Dashboard page
export interface RecentActivityItem {
  id: string;
  title: string;
  type: string; // e.g., "Page", "Block", "File"
  lastModified: string;
  editor: string; // User who last modified
  url: string; // Link to the item in CMS
  icon: LucideIcon; // Icon for the item type
}


const activities_placeholder = [ // Renamed to avoid conflict if RecentActivityItem is imported by dashboard
  { id: "act1", user: "Alice", action: "edited page 'Homepage'", time: "2m ago", avatar: "https://placehold.co/40x40.png?text=A" },
  { id: "act2", user: "Bob", action: "published content block 'Hero Banner'", time: "15m ago", avatar: "https://placehold.co/40x40.png?text=B" },
  { id: "act3", user: "Charlie", action: "uploaded 'team-photo.jpg'", time: "1h ago", avatar: "https://placehold.co/40x40.png?text=C" },
  { id: "act4", user: "Alice", action: "created new schema 'Blog Post'", time: "3h ago", avatar: "https://placehold.co/40x40.png?text=A" },
  { id: "act5", user: "David", action: "updated user role 'Editor'", time: "5h ago", avatar: "https://placehold.co/40x40.png?text=D" },
];

// This component will show generic audit log style activities for now
export function RecentActivityFeed() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <Activity className="h-5 w-5" />
          General Activity (Placeholder)
        </CardTitle>
        <CardDescription>Latest general changes and updates across the CMS.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities_placeholder.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.avatar} alt={activity.user} data-ai-hint="user avatar" />
                  <AvatarFallback>{activity.user.substring(0,1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">
                    <span className="font-semibold">{activity.user}</span> {activity.action}.
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
             <p className="text-center text-muted-foreground text-xs pt-4">This is placeholder activity data. Real audit logs are in the Audit Logs section.</p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
