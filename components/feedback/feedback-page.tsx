"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { cn, fetcher } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeAgoIntl } from "@/components/shared/time-ago";

type FeedbackItem = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export default function FeedbackPage() {
  const { data, isLoading, mutate } = useSWR<{ items: FeedbackItem[] }>(
    "/api/feedback?limit=30",
    fetcher,
  );

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = name.trim().length >= 2 && message.trim().length >= 1 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(payload?.error || "Failed to send feedback");
        return;
      }

      toast.success("Thanks! Your feedback has been sent.");
      setMessage("");
      await mutate();
    } catch {
      toast.error("Failed to send feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto my-8 w-full max-w-3xl px-6">
      <div className="grids my-16 text-balance py-6 text-center font-satoshi text-[40px] font-black leading-[1.15] tracking-tight sm:text-5xl md:text-6xl md:leading-[1.15]">
        Feedback{" "}
        <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-[30px] text-transparent sm:text-3xl md:text-4xl">
          help us do better
        </span>
      </div>

      <div className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="text-sm font-medium">Name</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={32}
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Email (optional)</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              maxLength={100}
            />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Message</div>
            <div className="text-xs text-muted-foreground">
              {message.length}/500
            </div>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you think..."
            maxLength={500}
            rows={5}
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setName("");
              setEmail("");
              setMessage("");
            }}
            disabled={isSubmitting}
          >
            Clear
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm font-semibold">{items.length} messages</div>
        <Button variant="ghost" size="sm" onClick={() => mutate()} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        ) : items.length === 0 ? (
          <div className="rounded-xl border bg-muted/10 p-6 text-center text-sm text-muted-foreground">
            No feedback yet. Be the first to leave a message.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{item.name}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <TimeAgoIntl date={new Date(item.createdAt)} />
                </div>
              </div>
              <div className={cn("mt-2 whitespace-pre-wrap text-sm text-foreground/90")}>
                {item.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

