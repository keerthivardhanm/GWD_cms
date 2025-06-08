
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] !== 'dashboard' && pathSegments[0] !== 'pages' && pathSegments[0] !== 'content-files' && pathSegments[0] !== 'content-blocks' && pathSegments[0] !== 'media-manager' && pathSegments[0] !== 'schema-builder' && pathSegments[0] !== 'form-builder' && pathSegments[0] !== 'access-control' && pathSegments[0] !== 'audit-logs' && pathSegments[0] !== 'settings') {
    // Don't show breadcrumbs for root or non-app pages
    return null;
  }
  
  const breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const isCurrent = index === pathSegments.length - 1;
    return { label, href, isCurrent };
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
            <Link
              href={crumb.href}
              className={cn(
                "hover:text-primary transition-colors",
                crumb.isCurrent ? "text-foreground font-medium pointer-events-none" : "text-muted-foreground"
              )}
              aria-current={crumb.isCurrent ? "page" : undefined}
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
