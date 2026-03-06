import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

import { siteConfig } from "./site";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      { href: "/dashboard", icon: "dashboard", title: "Dashboard" },
      { href: "/dashboard/urls", icon: "link", title: "Short Urls" },
      { href: "/emails", icon: "mail", title: "Emails" },
      { href: "/temp-gmail", icon: "mail", title: "Temp Gmail" },
      { href: "/dashboard/upgrade", icon: "crown", title: "Upgrade" },
    ],
  },
  {
    title: "ADMIN",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/users",
        icon: "users",
        title: "Users",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/urls",
        icon: "link",
        title: "URLs",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/records",
        icon: "globe",
        title: "Records",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/storage",
        icon: "storage",
        title: "Cloud Storage Manage",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/system",
        icon: "settings",
        title: "System Settings",
        authorizeOnly: UserRole.ADMIN,
      },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      { href: "/dashboard/settings", icon: "userSettings", title: "Settings" },
      { href: "/docs", icon: "bookOpen", title: "Documentation" },
      {
        href: "/feedback",
        icon: "messageQuoted",
        title: "Feedback",
      },
      {
        href: "https://t.me/blackpink2812",
        icon: "messageQuoted",
        title: "Support",
        external: true,
      },
    ],
  },
];
