"use client";

import { useEffect } from "react";

interface GoogleAdProps {
    slot?: string;
}

export function GoogleAd({ slot = "4698208465" }: GoogleAdProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error", err);
        }
    }, []);

    return (
        <div className="my-2 min-h-[100px] w-full overflow-hidden text-center">
            {/* mail1s */}
            <ins
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
