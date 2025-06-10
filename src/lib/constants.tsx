
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Boxes,
  Database,
  Grid,
  ShieldCheck, // Changed from Bug
  History,
  Settings,
  ClipboardList,
  Search,
  Users
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  groupLabel?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pages', label: 'Pages', icon: FileText },
  { href: '/content-files', label: 'Content Files', icon: Boxes },
  { href: '/content-blocks', label: 'Content Blocks', icon: Grid },
  // { href: '/media-manager', label: 'Media Manager', icon: ImageIcon }, // Removed Media Manager
  // {
  //   groupLabel: 'Development',
  //   href: '#', // Placeholder, not a direct link
  //   label: 'Development Tools', // Not displayed directly, for grouping logic
  //   icon: Database, // Generic icon for group
  //   subItems: [
  //     { href: '/schema-builder', label: 'Schema Builder', icon: Database },
  //     { href: '/form-builder', label: 'Form Builder', icon: ClipboardList },
  //   ],
  // },
  {
    groupLabel: 'Administration',
    href: '#',
    label: 'Admin Tools',
    icon: Settings,
    subItems: [
      { href: '/access-control', label: 'Access Control', icon: Users },
      { href: '/audit-logs', label: 'Audit Logs', icon: History },
      { href: '/settings', label: 'Global Settings', icon: Settings },
    ],
  },
];

export const APP_NAME = "Apollo CMS"; // Reverted from "Apollo Allied Health Academy"
