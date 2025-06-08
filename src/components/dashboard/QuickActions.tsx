
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink, LibraryBig, Settings, Search, Sparkles, Icon } from "lucide-react";

interface QuickActionItemProps {
  href: string;
  icon: Icon;
  label: string;
  isExternal?: boolean;
}

const QuickActionItem: React.FC<QuickActionItemProps> = ({ href, icon: Icon, label, isExternal }) => {
  return (
    <Link href={href} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : undefined} passHref>
      <Card className="shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 h-full flex flex-col items-center justify-center p-1 text-center aspect-square sm:aspect-auto sm:p-2 md:p-4">
        <CardContent className="p-2 sm:p-3 flex flex-col items-center justify-center gap-2">
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-foreground">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
};

const quickActions = [
  { href: "/pages", icon: PlusCircle, label: "Create Section" },
  { href: "/", icon: ExternalLink, label: "View Live Site", isExternal: true },
  { href: "/media-manager", icon: LibraryBig, label: "Media Library" },
  { href: "/settings", icon: Settings, label: "CMS Settings" },
  { href: "/dashboard", icon: Search, label: "Search Content" }, // Placeholder link
  { href: "/dashboard", icon: Sparkles, label: "AI Assistant" }, // Placeholder link
];

export function QuickActions() {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
        {quickActions.map((action) => (
          <QuickActionItem key={action.label} {...action} />
        ))}
      </div>
    </div>
  );
}
