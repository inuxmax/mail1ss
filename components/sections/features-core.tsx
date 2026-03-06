import { Icons } from "@/components/shared/icons";
import Link from "next/link";

export default function FeaturesCore() {
  return (
    <section className="relative overflow-hidden py-10">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white">
            Core Features
          </h2>
          <p className="mt-2 text-neutral-300">
            Temp Email, Temp Gmail and Short URLs optimized for makers and QA
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 text-left shadow-sm backdrop-blur-md transition-all hover:border-neutral-500">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <Icons.mail className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Temp Email</h3>
            </div>
            <ul className="space-y-1 text-neutral-300">
              <li>Live inbox, attachments preview</li>
              <li>Compose and forward easily</li>
              <li>Auto-expire by plan</li>
            </ul>
            <div className="mt-4 text-sm">
              <Link href="/emails" className="underline">
                Open Temp Email
              </Link>
            </div>
          </div>

          <div className="group rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 text-left shadow-sm backdrop-blur-md transition-all hover:border-neutral-500">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                <Icons.mailPlus className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Temp Gmail</h3>
            </div>
            <ul className="space-y-1 text-neutral-300">
              <li>Quota based temporary Gmail accounts</li>
              <li>API for list/unread and message content</li>
              <li>Detailed logs for QA automation</li>
            </ul>
            <div className="mt-4 text-sm">
              <Link href="/temp-gmail" className="underline">
                Open Temp Gmail
              </Link>
            </div>
          </div>

          <div className="group rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 text-left shadow-sm backdrop-blur-md transition-all hover:border-neutral-500">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-600 text-white">
                <Icons.link className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Short URLs</h3>
            </div>
            <ul className="space-y-1 text-neutral-300">
              <li>Instant short links with password and expiry</li>
              <li>QR code generation and basic analytics</li>
              <li>Turn uploads into shareable short links</li>
            </ul>
            <div className="mt-4 text-sm">
              <Link href="/dashboard/urls" className="underline">
                Manage Short URLs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
