"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { format } from "date-fns";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { cn, fetcher } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface TempGmailListProps {
  selectedEmail: string | null;
  selectedEmailId?: string | null;
  onBack?: () => void;
  className?: string;
}

interface Message {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  internalDate: string;
  html?: string;
  labelIds?: string[];
}

export function TempGmailList({ selectedEmail, selectedEmailId, onBack, className }: TempGmailListProps) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const { mutate: globalMutate } = useSWRConfig();

  const { data: messages, isLoading, mutate, isValidating } = useSWR<Message[]>(
    selectedEmail ? `/api/temp-gmail/inbox?email=${selectedEmail}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: messageDetail, isLoading: isLoadingDetail } = useSWR<Message>(
    selectedEmail && selectedMessageId
      ? `/api/temp-gmail/message/${selectedMessageId}?email=${selectedEmail}`
      : null,
    fetcher
  );

  if (!selectedEmail) {
    return (
      <div className={cn("flex h-full flex-1 items-center justify-center bg-background", className)}>
        <div className="text-center text-muted-foreground">
          <p>Select a temp gmail to view inbox</p>
        </div>
      </div>
    );
  }

  if (selectedMessageId) {
    return (
      <div className={cn("flex h-full flex-col bg-background", className)}>
        <div className="flex items-center gap-2 border-b p-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedMessageId(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold truncate">Message Detail</h2>
        </div>
        <ScrollArea className="flex-1 p-4">
          {isLoadingDetail && !messageDetail ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messageDetail ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h1 className="text-xl font-bold">{messageDetail.subject}</h1>
                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:justify-between">
                  <span className="font-medium text-foreground">From: {messageDetail.from}</span>
                  <span>{messageDetail.date}</span>
                </div>
              </div>
              <div
                className="prose max-w-none dark:prose-invert break-words"
                dangerouslySetInnerHTML={{ __html: messageDetail.html || "<p>No content</p>" }}
              />
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">Failed to load message</div>
          )}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold truncate">Inbox: {selectedEmail}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => mutate()} disabled={isValidating}>
          <RefreshCw className={cn("h-4 w-4", isValidating && "animate-spin")} />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
            <div className="space-y-2 p-4">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
        ) : messages?.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <p>Inbox is empty</p>
          </div>
        ) : (
          <div className="divide-y">
            {messages?.map((msg) => {
              const isUnread = msg.labelIds?.includes("UNREAD");
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                       setSelectedMessageId(msg.id);
                       // Optimistically update the UI to mark as read
                       mutate(
                         messages.map(m => 
                             m.id === msg.id 
                             ? { ...m, labelIds: m.labelIds?.filter(l => l !== 'UNREAD') } 
                             : m
                         ),
                         false
                       );
                       if (isUnread && selectedEmailId) {
                         globalMutate(`/api/temp-gmail/stats?id=${selectedEmailId}`);
                         globalMutate("/api/temp-gmail/stats/global");
                       }
                   }}
                  className={cn(
                       "cursor-pointer p-4 hover:bg-muted/50 transition-colors border-l-4",
                       isUnread 
                          ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-500" 
                          : "bg-neutral-50/50 dark:bg-neutral-900/50 border-transparent"
                    )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className={cn("truncate font-medium text-sm", isUnread && "font-bold text-foreground")}>
                        {msg.from}
                    </span>
                    <span className={cn("text-xs shrink-0", isUnread ? "text-blue-600 font-medium" : "text-muted-foreground")}>
                      {(() => {
                          try {
                              return msg.date ? format(new Date(msg.date), "MMM d, HH:mm") : "";
                          } catch {
                              return "";
                          }
                      })()}
                    </span>
                  </div>
                  <div className={cn("mb-1 text-sm truncate", isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                      {msg.subject || "(No Subject)"}
                  </div>
                  <div className={cn("line-clamp-2 text-xs break-all", isUnread ? "text-foreground/80" : "text-muted-foreground")}>
                    {msg.snippet}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
