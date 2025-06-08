import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity } from "lucide-react";

const activities = [
  { id: 1, user: "Alice", action: "edited page 'Homepage'", time: "2m ago", avatar: "https://placehold.co/40x40.png?text=A" },
  { id: 2, user: "Bob", action: "published content block 'Hero Banner'", time: "15m ago", avatar: "https://placehold.co/40x40.png?text=B" },
  { id: 3, user: "Charlie", action: "uploaded 'team-photo.jpg'", time: "1h ago", avatar: "https://placehold.co/40x40.png?text=C" },
  { id: 4, user: "Alice", action: "created new schema 'Blog Post'", time: "3h ago", avatar: "https://placehold.co/40x40.png?text=A" },
  { id: 5, user: "David", action: "updated user role 'Editor'", time: "5h ago", avatar: "https://placehold.co/40x40.png?text=D" },
];

export function RecentActivityFeed() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest changes and updates across the CMS.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities.map((activity) => (
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
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
