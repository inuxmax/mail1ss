"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SidebarNavItem } from "@/types";
import { Menu, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "next-view-transitions";
import pkg from "package.json";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/shared/icons";

interface DashboardSidebarProps {
  links: SidebarNavItem[];
  currentPlan?: string | null;
}

export function DashboardSidebar({ links, currentPlan }: DashboardSidebarProps) {
  const t = useTranslations("System");
  const path = usePathname();
  const upgradePath = "/dashboard/upgrade";
  const regularLinks = links.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.href !== upgradePath),
  }));
  const normalizedPlan = (currentPlan || "free").replaceAll("_", " ");

  const { isTablet } = useMediaQuery();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!isTablet);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    setIsSidebarExpanded(!isTablet);
  }, [isTablet]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="sticky top-0 h-full">
        <ScrollArea className="h-full overflow-y-auto border-r">
          <aside
            className={cn(
              isSidebarExpanded ? "w-[220px] xl:w-[260px]" : "w-[68px]",
              "hidden h-screen transition-all duration-200 md:block",
            )}
          >
            <div className="flex h-full max-h-screen flex-1 flex-col gap-2">
              <div className="flex h-14 items-center gap-2 p-4 lg:h-[60px]">
                {/* {isSidebarExpanded ? <ProjectSwitcher /> : null} */}

                {isSidebarExpanded && (
                  <>
                    <Icons.logo />
                    <Link
                      href="/"
                      style={{ fontFamily: "Bahamas Bold" }}
                      className="text-2xl font-bold"
                    >
                      {siteConfig.name}
                    </Link>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-9 lg:size-8"
                  onClick={toggleSidebar}
                >
                  {isSidebarExpanded ? (
                    <PanelLeftClose
                      size={18}
                      className="stroke-muted-foreground"
                    />
                  ) : (
                    <PanelRightClose
                      size={18}
                      className="stroke-muted-foreground"
                    />
                  )}
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </div>

              <nav className="flex flex-1 flex-col gap-8 px-4 pt-4">
                {regularLinks.map(
                  (section) =>
                    section.items.length > 0 && (
                      <section
                        key={section.title}
                        className="flex flex-col gap-0.5"
                      >
                        {isSidebarExpanded ? (
                          <p className="text-xs text-muted-foreground">
                            {t(section.title)}
                          </p>
                        ) : (
                          <div className="h-4" />
                        )}
                        {section.items.map((item) => {
                          const Icon = Icons[item.icon || "arrowRight"];
                          return (
                            item.href && (
                              <Fragment key={`link-fragment-${item.title}`}>
                                {isSidebarExpanded ? (
                                  <Link
                                    key={`link-${item.title}`}
                                    href={item.disabled ? "#" : item.href}
                                    className={cn(
                                      "flex items-center gap-3 rounded-md p-2 text-sm font-medium hover:bg-muted",
                                      path === item.href
                                        ? "bg-muted"
                                        : "text-muted-foreground hover:text-accent-foreground",
                                      item.disabled &&
                                        "cursor-not-allowed opacity-80 hover:bg-transparent hover:text-muted-foreground",
                                    )}
                                  >
                                    <Icon className="size-5" />
                                    {t(item.title)}
                                    {item.badge && (
                                      <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                ) : (
                                  <Tooltip key={`tooltip-${item.title}`}>
                                    <TooltipTrigger asChild>
                                      <Link
                                        key={`link-tooltip-${item.title}`}
                                        href={item.disabled ? "#" : item.href}
                                        className={cn(
                                          "flex items-center gap-3 rounded-md py-2 text-sm font-medium hover:bg-muted",
                                          path === item.href
                                            ? "bg-muted"
                                            : "text-muted-foreground hover:text-accent-foreground",
                                          item.disabled &&
                                            "cursor-not-allowed opacity-80 hover:bg-transparent hover:text-muted-foreground",
                                        )}
                                      >
                                        <span className="flex size-full items-center justify-center">
                                          <Icon className="size-5" />
                                        </span>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                      {t(item.title)}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </Fragment>
                            )
                          );
                        })}
                      </section>
                    ),
                )}
              </nav>

              <div className={cn("mt-auto px-3 pb-3", !isSidebarExpanded && "pb-4")}>
                {isSidebarExpanded ? (
                  <Link
                    href={upgradePath}
                    className={cn(
                      "block rounded-xl border p-3 shadow-sm transition-all",
                      "border-amber-400/40 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-orange-400/20 hover:shadow-md",
                      path === upgradePath && "ring-2 ring-amber-400/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icons.crown className="size-5 text-amber-600" />
                      <span className="text-sm font-semibold">{t("Upgrade")}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("Current Plan")}:{" "}
                      <span className="font-semibold uppercase text-foreground">
                        {normalizedPlan}
                      </span>
                    </p>
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={upgradePath}
                        className={cn(
                          "flex h-10 items-center justify-center rounded-lg border",
                          "border-amber-400/40 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-orange-400/20",
                          path === upgradePath && "ring-2 ring-amber-400/60",
                        )}
                      >
                        <Icons.crown className="size-5 text-amber-600" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {t("Upgrade")} · {t("Current Plan")}: {normalizedPlan}
                    </TooltipContent>
                  </Tooltip>
                )}

                {isSidebarExpanded && (
                  <div
                    className="mx-1 flex items-center gap-1 pb-1 pt-4 text-xs text-muted-foreground/90"
                    style={{ fontFamily: "Bahamas Bold" }}
                  >
                    Copyright {new Date().getFullYear()} &copy;
                    <Link
                      href={siteConfig.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {siteConfig.name}
                    </Link>
                    <Link
                      href={`${siteConfig.links.github}/releases/latest`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-thin underline-offset-2 hover:underline"
                    >
                      v{pkg.version}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export function MobileSheetSidebar({ links, currentPlan }: DashboardSidebarProps) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { isSm, isMobile } = useMediaQuery();
  const t = useTranslations("System");
  const upgradePath = "/dashboard/upgrade";
  const regularLinks = links.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.href !== upgradePath),
  }));
  const normalizedPlan = (currentPlan || "free").replaceAll("_", " ");

  if (isSm || isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 md:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <ScrollArea className="h-full overflow-y-auto">
            <div className="flex h-screen flex-col">
              <nav className="flex flex-1 flex-col gap-y-8 p-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  {/* <Icons.logo /> */}
                  <Image src="/favicon.ico" alt="logo" width={20} height={20} />
                  <span
                    style={{ fontFamily: "Bahamas Bold" }}
                    className="pt-0.5 text-xl font-bold"
                  >
                    {siteConfig.name}
                  </span>
                </Link>

                {regularLinks.map(
                  (section) =>
                    section.items.length > 0 && (
                      <section
                        key={section.title}
                        className="flex flex-col gap-0.5"
                      >
                        <p className="text-xs text-muted-foreground">
                          {t(section.title)}
                        </p>

                        {section.items.map((item) => {
                          const Icon = Icons[item.icon || "arrowRight"];
                          return (
                            item.href && (
                              <Fragment key={`link-fragment-${item.title}`}>
                                <Link
                                  key={`link-${item.title}`}
                                  onClick={() => {
                                    if (!item.disabled) setOpen(false);
                                  }}
                                  href={item.disabled ? "#" : item.href}
                                  className={cn(
                                    "flex items-center gap-3 rounded-md p-2 text-sm font-medium hover:bg-muted",
                                    path === item.href
                                      ? "bg-muted"
                                      : "text-muted-foreground hover:text-accent-foreground",
                                    item.disabled &&
                                      "cursor-not-allowed opacity-80 hover:bg-transparent hover:text-muted-foreground",
                                  )}
                                >
                                  <Icon className="size-5" />
                                  {t(item.title)}
                                  {item.badge && (
                                    <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Link>
                              </Fragment>
                            )
                          );
                        })}
                      </section>
                    ),
                )}

                <div className="mt-auto space-y-3">
                  <Link
                    href={upgradePath}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "mx-2 block rounded-xl border p-3 shadow-sm transition-all",
                      "border-amber-400/40 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-orange-400/20 hover:shadow-md",
                      path === upgradePath && "ring-2 ring-amber-400/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icons.crown className="size-5 text-amber-600" />
                      <span className="text-sm font-semibold">{t("Upgrade")}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("Current Plan")}:{" "}
                      <span className="font-semibold uppercase text-foreground">
                        {normalizedPlan}
                      </span>
                    </p>
                  </Link>

                  <div
                    className="mx-3 flex items-center gap-1 pb-3 pt-2 font-mono text-xs text-muted-foreground/90"
                    style={{ fontFamily: "Bahamas Bold" }}
                  >
                    Copyright {new Date().getFullYear()} &copy;
                    <Link
                      href={siteConfig.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {siteConfig.name}
                    </Link>
                    <Link
                      href={`${siteConfig.links.github}/releases/latest`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-thin underline-offset-2 hover:underline"
                    >
                      v{pkg.version}
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="flex size-9 animate-pulse rounded-lg bg-muted md:hidden" />
  );
}
