
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink, LibraryBig, Settings, Search, Sparkles, type LucideIcon } from "lucide-react";

interface QuickActionItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isExternal?: boolean;
}

const QuickActionItem: React.FC<QuickActionItemProps> = ({ href, icon: IconComponent, label, isExternal }) => {
  return (
    <Link href={href} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : undefined} asChild>
      <Button variant="outline" size="sm" className="h-auto px-3 py-2 flex flex-col items-center justify-center text-center w-[100px] shrink-0">
        <IconComponent className="h-5 w-5 mb-1 text-primary" />
        <span className="text-xs font-medium leading-tight block whitespace-nowrap overflow-hidden text-ellipsis w-full">{label}</span>
      </Button>
    </Link>
  );
};

const quickActionsList = [
  { href: "/pages", icon: PlusCircle, label: "Create Section" },
  { href: "https://apolloknowledge.netlify.app/", icon: ExternalLink, label: "View Live Site", isExternal: true },
  { href: "/media-manager", icon: LibraryBig, label: "Media Library" },
  { href: "/settings", icon: Settings, label: "CMS Settings" },
  { href: "/dashboard", icon: Search, label: "Search Content" }, 
  { href: "/dashboard", icon: Sparkles, label: "AI Assistant" }, 
];

export function QuickActions() {
  return (
    <div className="mb-6">
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 items-stretch">
        {quickActionsList.map((action) => (
          <QuickActionItem key={action.label} {...action} />
        ))}
      </div>
    </div>
  );
}
