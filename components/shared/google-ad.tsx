"use client";

import { useEffect, useRef } from "react";

interface GoogleAdProps {
  slot?: string;
}

export function GoogleAd({ slot = "4698208465" }: GoogleAdProps) {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    const ad = adRef.current;
    if (!ad) return;
    if (ad.getAttribute("data-adsbygoogle-status")) return;
    if (ad.getAttribute("data-mail1s-ads-init") === "true") return;

    ad.setAttribute("data-mail1s-ads-init", "true");
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      ad.removeAttribute("data-mail1s-ads-init");
      if (process.env.NODE_ENV !== "production") {
        console.error("AdSense error", err);
      }
    }
  }, []);

  return (
    <div className="my-2 min-h-[100px] w-full overflow-hidden text-center">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4443334856736382"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
