"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, RefreshCw, Mail, Sparkles, Search, PanelRightClose, PanelLeftClose, ChevronLeft, ChevronRight, Inbox, MessageSquare, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, fetcher } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/shared/icons";
import { TimeAgoIntl } from "@/components/shared/time-ago";
import { CopyButton } from "@/components/shared/copy-button";

type GmailAccount = {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type UserTempGmail = {
  id: string;
  userId: string;
  gmailAccountId: string;
  tempEmailAddress: string;
  createdAt: string;
  expiresAt?: string | null;
};

interface TempGmailSidebarProps {
  selectedEmail: string | null;
  onSelectEmail: (email: string | null, id?: string) => void;
  className?: string;
  isCollapsed?: boolean;
  setIsCollapsed?: (isCollapsed: boolean) => void;
}

type UserTempGmailWithAccount = UserTempGmail & { gmailAccount: GmailAccount };

function GmailStats({ id }: { id: string }) {
  const { data } = useSWR<{ inboxCount: number; unreadCount: number }>(`/api/temp-gmail/stats?id=${id}`, fetcher);
  
  if (!data) return <div className="h-5 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />;
  
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
       {data.unreadCount > 0 && (
         <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[11px] font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
           {data.unreadCount}
         </span>
       )}
       <span>{data.inboxCount} received</span>
    </div>
  );
}

export function TempGmailSidebar({
  selectedEmail,
  onSelectEmail,
  className,
  isCollapsed,
  setIsCollapsed,
}: TempGmailSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBaseAccount, setSelectedBaseAccount] = useState<string>("");
  const [customLocalPart, setCustomLocalPart] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);

  const { data: accounts } = useSWR<GmailAccount[]>("/api/temp-gmail/available", fetcher);

  const { data: globalStats } = useSWR<{
    emailAddress: number;
    inboxEmails: number;
    unreadEmails: number;
  }>("/api/temp-gmail/stats/global", fetcher);

  const [page, setPage] = useState(1);
  const { data: response, mutate, isLoading } = useSWR<{
    items: UserTempGmailWithAccount[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }>(`/api/temp-gmail?page=${page}&limit=10`, fetcher);

  const myTempGmails = response?.items || [];
  const total = response?.total || 0;
  const totalPages = Math.max(1, response?.totalPages || 1);

  useEffect(() => {
    if (!isLoading && response && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, isLoading, response]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBaseAccount || !customLocalPart) {
        toast.error("Please fill all fields");
        return;
    }

    setIsCreating(true);
    try {
      const account = accounts?.find((a) => a.id === selectedBaseAccount);
      if (!account) return;

      const [baseLocal, baseDomain] = account.email.split("@");
      const tempEmail = `${customLocalPart}@${baseDomain}`;

      const res = await fetch("/api/temp-gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gmailAccountId: selectedBaseAccount,
          tempEmailAddress: tempEmail,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      toast.success("Created successfully");
      setIsOpen(false);
      setCustomLocalPart("");
      setPage(1);
      mutate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!emailToDelete) return;
    try {
      await fetch(`/api/temp-gmail?id=${emailToDelete}`, { method: "DELETE" });
      mutate();
      if (myTempGmails?.find((t) => t.id === emailToDelete)?.tempEmailAddress === selectedEmail) {
        onSelectEmail(null);
      }
      toast.success("Deleted");
      setShowDeleteModal(false);
      setEmailToDelete(null);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const generateRandomDot = (baseLocal: string) => {
      if (baseLocal.length <= 1) return baseLocal;
      let result = "";
      // Ensure at least one dot
      let hasDot = false;
      
      while (!hasDot) {
        result = baseLocal[0];
        for (let i = 1; i < baseLocal.length; i++) {
            if (Math.random() > 0.5) {
                result += '.';
                hasDot = true;
            }
            result += baseLocal[i];
        }
      }
      return result;
  }

  const handleRandom = () => {
      if (accounts && accounts.length > 0) {
           // Always randomly select account
           const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
           setSelectedBaseAccount(randomAccount.id);
           const [baseLocal] = randomAccount.email.split("@");
           setCustomLocalPart(generateRandomDot(baseLocal));
      }
  }

  const filteredGmails = myTempGmails?.filter(t => t.tempEmailAddress.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={cn("flex h-full flex-col border-r bg-muted/10 transition-all", className)}>
      {/* Header */}
      <div className="border-b p-2 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
            {!isCollapsed && (
                <div className="flex w-full items-center gap-2">
                     <Button
                        className="size-8 lg:size-7"
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                            setIsRefreshing(true);
                            await mutate();
                            setIsRefreshing(false);
                        }}
                        disabled={isRefreshing}
                        >
                        <Icons.refreshCw
                            size={15}
                            className={
                            isRefreshing || isLoading
                                ? "animate-spin stroke-muted-foreground"
                                : "stroke-muted-foreground"
                            }
                        />
                    </Button>
                    <div className="relative w-full grow">
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search emails"
                            className="h-[30px] w-full border p-1 pl-8 text-xs placeholder:text-xs"
                        />
                        <Search className="absolute left-2 top-2 size-4 text-gray-500" />
                    </div>
                </div>
            )}
             <Button
                className={cn("px-1", !isCollapsed ? "size-7" : "size-8")}
                variant="outline"
                size="icon"
                onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? (
                <PanelRightClose size={16} className="stroke-muted-foreground" />
                ) : (
                <PanelLeftClose size={16} className="stroke-muted-foreground" />
                )}
            </Button>
        </div>

         <Button
          className={
            isCollapsed
              ? "mx-auto size-9 lg:size-8"
              : "flex h-8 w-full items-center justify-center gap-2"
          }
          variant="default"
          size="icon"
          onClick={() => {
            setIsOpen(true);
            handleRandom();
          }}
        >
          <Plus className="size-4" />
          {!isCollapsed && (
            <span className="text-xs">Create Temp Gmail</span>
          )}
        </Button>

         {!isCollapsed && globalStats && (
           <div className="mt-2 grid grid-cols-2 gap-2">
             <div className="flex flex-col items-center justify-center rounded-md border bg-muted/50 p-2 text-center">
               <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                 <Mail className="h-3 w-3" />
                 <span>Email Address</span>
               </div>
               <span className="text-sm font-bold">{globalStats.emailAddress}</span>
             </div>
             <div className="flex flex-col items-center justify-center rounded-md border bg-muted/50 p-2 text-center">
               <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                 <Inbox className="h-3 w-3" />
                 <span>Inbox Emails</span>
               </div>
               <span className="text-sm font-bold">{globalStats.inboxEmails}</span>
             </div>
             <div className="flex flex-col items-center justify-center rounded-md border bg-muted/50 p-2 text-center">
               <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                 <AlertCircle className="h-3 w-3" />
                 <span>Unread Emails</span>
               </div>
               <span className="text-sm font-bold">{globalStats.unreadEmails}</span>
             </div>
               <div className="flex flex-col items-center justify-center rounded-md border bg-muted/50 p-2 text-center h-[58px]">
                  <div className="flex gap-1 h-full items-center">
                    <div className="h-2 w-2 bg-neutral-600 rounded-sm"></div>
                    <div className="h-2 w-2 bg-neutral-400 rounded-sm"></div>
                    <div className="h-2 w-2 bg-neutral-300 rounded-sm"></div>
                  </div>
               </div>
             </div>
           )}
        </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {isLoading ? (
             Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : filteredGmails?.length === 0 ? (
             <div className="p-4 text-center text-sm text-muted-foreground">
              No temp gmails found.
            </div>
          ) : (
             filteredGmails?.map((item) => (
               <div
                key={item.id}
                onClick={() => onSelectEmail(item.tempEmailAddress, item.id)}
                className={cn(
                    "group relative flex cursor-pointer flex-col gap-1 rounded-md bg-neutral-100 px-3 py-2 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-gray-700",
                    selectedEmail === item.tempEmailAddress && "bg-neutral-200 dark:bg-gray-700 ring-1 ring-primary/20"
                )}
               >
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 overflow-hidden">
                        <Mail className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">
                            {item.tempEmailAddress}
                        </span>
                     </div>
                 </div>
                 
                 <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <GmailStats id={item.id} />
                    <div className="flex items-center gap-1">
                        <div className="hidden group-hover:flex items-center gap-1">
                             <CopyButton
                                value={item.tempEmailAddress}
                                className="size-5 rounded border p-1 hover:bg-background"
                             />
                             <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 rounded border p-1 text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEmailToDelete(item.id);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </div>
                        <span className="group-hover:hidden">
                            <TimeAgoIntl date={item.createdAt} />
                        </span>
                    </div>
                 </div>
               </div>
             ))
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between border-t bg-background p-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">
          {page} / {totalPages} (Total: {total})
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Create Modal */}
      {isOpen && (
        <Modal showModal={isOpen} setShowModal={setIsOpen}>
            <div className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Create new email</h2>
                <form onSubmit={handleCreate}>
                     <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <div className="flex items-center justify-center">
                             <Input
                                value={customLocalPart}
                                onChange={(e) => setCustomLocalPart(e.target.value)}
                                placeholder="Enter alias"
                                className="w-full rounded-r-none"
                                required
                            />
                             <div className="flex items-center justify-center border bg-muted/50 px-3 text-sm text-muted-foreground w-[120px] select-none">
                                @gmail.com
                             </div>
                             <Button
                                className="rounded-l-none"
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleRandom}
                            >
                                <Sparkles className="h-4 w-4 text-slate-500" />
                            </Button>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Note: System automatically generates a valid alias.
                        </p>
                     </div>
                     <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create"}
                        </Button>
                     </div>
                </form>
            </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
             <div className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Delete temp gmail</h2>
                <p className="mb-4 text-sm text-neutral-600">
                    Are you sure you want to delete this temp gmail? All emails in inbox will be lost.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Confirm Delete
                    </Button>
                </div>
             </div>
        </Modal>
      )}
    </div>
  );
}
