"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { PostCard } from "./post-card";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function PostFeed() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const { data, isLoading } = useSWR("/api/posts?page=1&limit=10", fetcher);

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 w-full mt-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2 w-full max-w-3xl">
          <div className="h-8 w-1.5 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-bold tracking-tight">Mail1s.net Timeline</h2>
        </div>
        <div className="flex flex-col gap-8 w-full max-w-3xl">
            {data?.data?.map((post: any) => (
                <PostCard key={post.id} post={post} isAdmin={isAdmin} />
            ))}
        </div>
        {data?.data?.length === 0 && (
            <div className="w-full max-w-3xl text-center p-12 bg-muted/50 rounded-xl border border-dashed">
                <p className="text-muted-foreground text-lg">No posts yet. Stay tuned!</p>
            </div>
        )}
    </div>
  );
}
