
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink, LibraryBig, Settings, Search, Sparkles, type LucideIcon, Loader2 } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_DOC_ID = "globalAppSettings";
const SETTINGS_COLLECTION = "config";

interface QuickActionItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isExternal?: boolean;
  isLoading?: boolean;
}

const QuickActionItem: React.FC<QuickActionItemProps> = ({ href, icon: IconComponent, label, isExternal, isLoading }) => {
  return (
    <Button variant="outline" size="sm" className="h-auto px-3 py-2 flex flex-col items-center justify-center text-center w-[100px] shrink-0" asChild={!isLoading && !!href} disabled={isLoading || !href}>
      {isLoading ? (
         <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-5 w-5 mb-1 animate-spin text-primary" />
            <span className="text-xs font-medium leading-tight block whitespace-nowrap overflow-hidden text-ellipsis w-full">{label}</span>
        </div>
      ) : (
        <Link href={href || "#"} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : undefined} passHref>
            <IconComponent className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs font-medium leading-tight block whitespace-nowrap overflow-hidden text-ellipsis w-full">{label}</span>
        </Link>
      )}
    </Button>
  );
};


export function QuickActions() {
  const [liveSiteUrl, setLiveSiteUrl] = useState<string | null>(null);
  const [loadingSiteUrl, setLoadingSiteUrl] = useState(true);

  useEffect(() => {
    const fetchSiteUrl = async () => {
      setLoadingSiteUrl(true);
      try {
        const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const settingsData = docSnap.data();
          setLiveSiteUrl(settingsData?.siteUrl || "https://example.com"); // Fallback URL
        } else {
          setLiveSiteUrl("https://example.com"); // Fallback if settings doc doesn't exist
        }
      } catch (error) {
        console.error("Error fetching site URL for Quick Actions:", error);
        setLiveSiteUrl("https://example.com"); // Fallback on error
      } finally {
        setLoadingSiteUrl(false);
      }
    };
    fetchSiteUrl();
  }, []);
  
  const quickActionsList = [
    { href: "/pages", icon: PlusCircle, label: "Create Section" },
    { href: liveSiteUrl, icon: ExternalLink, label: "View Live Site", isExternal: true, isLoading: loadingSiteUrl },
    { href: "/media-manager", icon: LibraryBig, label: "Media Library" },
    { href: "/settings", icon: Settings, label: "CMS Settings" },
    { href: "/dashboard", icon: Search, label: "Search Content" }, 
    { href: "/dashboard", icon: Sparkles, label: "AI Assistant" }, 
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 items-stretch">
        {quickActionsList.map((action) => (
          <QuickActionItem 
            key={action.label} 
            href={action.href || "#"} // Provide a fallback href if null
            icon={action.icon}
            label={action.label}
            isExternal={action.isExternal}
            isLoading={action.isLoading}
          />
        ))}
      </div>
    </div>
  );
}
