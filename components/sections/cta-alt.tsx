import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function CtaAlt({ userId }: { userId?: string }) {
  return (
    <section className="relative overflow-hidden py-12">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="rounded-2xl border border-neutral-700 bg-neutral-900/60 p-8 text-center shadow-sm backdrop-blur-md">
          <h3 className="text-2xl font-black tracking-tight text-white">
            Get started with Mail1s.net
          </h3>
          <p className="mt-2 text-neutral-300">
            Sign in to manage Temp Email, Temp Gmail and Short URLs. Create an API key for integrations.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              prefetch={true}
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "px-4 text-[15px] font-semibold",
              )}
            >
              <span>{userId ? "Open Dashboard" : "Sign in for free"}</span>
            </Link>
            <Link
              href="/dashboard/settings"
              prefetch={true}
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg", variant: "outline" }),
                "px-4 text-[15px] font-semibold",
              )}
            >
              <span>Create API Key</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
