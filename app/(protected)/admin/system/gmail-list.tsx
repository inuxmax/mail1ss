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
import { GmailAccount } from "@prisma/client";

export default function GmailList() {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<{
    total: number;
    list: GmailAccount[];
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
                    <TableCell className="text-right">
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
