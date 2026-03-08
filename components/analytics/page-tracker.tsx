"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Prevent double tracking in strict mode or quick re-renders
    if (trackedPath.current === pathname) return;
    
    const track = async () => {
        try {
            await fetch("/api/analytics/visit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: pathname })
            });
            trackedPath.current = pathname;
        } catch (error) {
            console.error("Tracking failed", error);
        }
    };

    // Delay slightly to ensure page is loaded
    const timeout = setTimeout(track, 1000);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
