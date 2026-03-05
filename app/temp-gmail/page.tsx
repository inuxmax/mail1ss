"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { TempGmailSidebar } from "@/components/temp-gmail/TempGmailSidebar";
import { TempGmailList } from "@/components/temp-gmail/TempGmailList";

export default function TempGmailPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const { isMobile } = useMediaQuery();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (isMobile && selectedEmail) {
      setIsCollapsed(true);
    } else {
        setIsCollapsed(false);
    }
  }, [isMobile, selectedEmail]);

  return (
    <div className="flex h-[calc(100vh-60px)] w-full">
      <TempGmailSidebar
        className={cn(
          !isCollapsed ? "w-64 xl:w-72" : "hidden",
          isMobile && !isCollapsed ? "w-screen" : "",
        )}
        onSelectEmail={(email, id) => {
            setSelectedEmail(email);
            if (id) setSelectedEmailId(id);
        }}
        selectedEmail={selectedEmail}
        isCollapsed={isCollapsed}
      />
      <div className={cn("flex-1", isMobile && !isCollapsed && "hidden")}>
         <TempGmailList
            selectedEmail={selectedEmail}
            selectedEmailId={selectedEmailId}
            onBack={() => setSelectedEmail(null)}
            className="h-full"
         />
      </div>
    </div>
  );
}
