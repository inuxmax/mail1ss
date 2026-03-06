"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

import UrlShortener from "./url-shortener";

export default function HeroLandingAlt({
  userId,
}: {
  userId: string | undefined;
}) {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900" />
        <div className="absolute left-1/2 top-[-20%] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-violet-600/20 blur-3xl sm:h-[480px] sm:w-[480px]" />
      </div>

      <div className="container flex max-w-screen-xl flex-col items-center gap-8 text-center">
        <h1 className="text-balance font-satoshi text-[40px] font-black leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.15]">
          <span className="mr-2">A Hub for</span>
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
            Temp Email, Temp Gmail & URL Shortening
          </span>
        </h1>

        <p className="max-w-3xl text-balance text-neutral-300 sm:text-lg">
          Create disposable emails for testing and signups, use Temp Gmail for automation, and shorten URLs with analytics and QR — all in one dashboard.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/emails"
            prefetch={true}
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg" }),
              "px-4 text-[15px] font-semibold",
            )}
          >
            <span>Temp Email</span>
          </Link>
          <Link
            href="/temp-gmail"
            prefetch={true}
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg", variant: "outline" }),
              "gap-2 bg-neutral-100 px-4 text-[15px] font-semibold text-neutral-900 hover:bg-neutral-200",
            )}
          >
            <span>Temp Gmail</span>
            <Icons.mail className="size-4" />
          </Link>
          <Link
            href="/dashboard/urls"
            prefetch={true}
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg" }),
              "px-4 text-[15px] font-semibold",
            )}
          >
            <span>Short URLs</span>
          </Link>
          <Link
            href="/dashboard"
            prefetch={true}
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg", variant: "outline" }),
              "px-4 text-[15px] font-semibold",
            )}
          >
            <span>{userId ? "Dashboard" : "Sign in for free"}</span>
          </Link>
        </div>

        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 text-left shadow-sm backdrop-blur-md transition-all hover:border-neutral-500">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <Icons.mail className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Temp Email</h3>
            </div>
            <p className="text-neutral-300">
              Create/compose addresses, live inbox view, and attachments download.
            </p>
          </div>

          <div className="group rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 text-left shadow-sm backdrop-blur-md transition-all hover:border-neutral-500">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                <Icons.mailPlus className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Temp Gmail</h3>
            </div>
            <p className="text-neutral-300">
              Create temporary Gmail with quota, API for list/unread, message content and logs.
            </p>
          </div>

          <div className="group rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 text-left shadow-sm backdrop-blur-md transition-all hover:border-neutral-500">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-600 text-white">
                <Icons.link className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-white">URL Shortening</h3>
            </div>
            <p className="text-neutral-300">
              Create short URLs instantly with password/expiry, QR codes and basic analytics.
            </p>
          </div>
        </div>

        <div className="grids grids-dark mx-auto my-10 flex w-full max-w-6xl px-4">
          <UrlShortener />
        </div>
      </div>
    </section>
  );
}
