
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Database,
  Grid,
  ShieldCheck,
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
  { href: '/content-blocks', label: 'Content Blocks', icon: Grid },
  { href: '/schema-builder', label: 'Schema Builder', icon: Database },
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

export const APP_NAME = "Apollo CMS";
