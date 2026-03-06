"use client";

import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Loader2, Trash } from "lucide-react";

import { fetcher } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { TimeAgoIntl } from "@/components/shared/time-ago";

type GmailAccountItem = {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
  expiresAtMs: number | null;
};

export default function GmailList() {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<{
    total: number;
    list: GmailAccountItem[];
  }>("/api/admin/gmail?page=1&pageSize=10", fetcher);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/gmail?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Gmail account disconnected");
      mutate();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRefresh = async (id: string) => {
    setIsRefreshing(id);
    try {
      const res = await fetch(`/api/admin/gmail/refresh?id=${id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to refresh token");
      toast.success("Access token refreshed");
      mutate();
    } catch (error) {
      toast.error("Refresh token failed");
    } finally {
      setIsRefreshing(null);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connected Gmail Accounts</CardTitle>
          <Button
            onClick={() => (window.location.href = "/api/admin/gmail/connect")}
          >
            Connect Gmail
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data?.list.length === 0 ? (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>No Gmail accounts</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Connect a Gmail account to enable Temp Gmail feature.
            </EmptyPlaceholder.Description>
          </EmptyPlaceholder>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Connected At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.list.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.email}
                    </TableCell>
                    <TableCell>
                      <TimeAgoIntl date={new Date(account.createdAt)} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-xs " +
                          (account.status === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : account.status === "Token expired"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300")
                        }
                      >
                        {account.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (window.location.href = "/api/admin/gmail/connect")}
                        >
                          Reconnect
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isRefreshing === account.id}
                          onClick={() => handleRefresh(account.id)}
                        >
                          {isRefreshing === account.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Refresh"
                          )}
                        </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isDeleting === account.id}
                        onClick={() => handleDelete(account.id)}
                      >
                        {isDeleting === account.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
