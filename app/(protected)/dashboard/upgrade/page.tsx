"use client";

import type React from "react";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, nFormatter, cn } from "@/lib/utils";
import { PlanQuotaFormData } from "@/lib/dto/plan";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { motion } from "framer-motion";

type BenefitType = {
  text: string;
  checked: boolean;
  icon: React.ReactNode;
};

const getBenefits = (plan: PlanQuotaFormData) => [
  {
    text: `${nFormatter(plan.slTrackedClicks)} tracked clicks/mo`,
    checked: true,
    icon: <Icons.mousePointerClick className="size-4" />,
  },
  {
    text: `${nFormatter(plan.slNewLinks)} new links/mo`,
    checked: true,
    icon: <Icons.link className="size-4" />,
  },
  {
    text: `${plan.slAnalyticsRetention}-day analytics retention`,
    checked: true,
    icon: <Icons.calendar className="size-4" />,
  },

  {
    text: `${nFormatter(plan.emEmailAddresses)} email addresses/mo`,
    checked: true,
    icon: <Icons.mail className="size-4" />,
  },


  {
    text: "Advanced analytics",
    checked: plan.slAdvancedAnalytics,
    icon: <Icons.lineChart className="size-4" />,
  },
  {
    text: `${plan.appSupport.charAt(0).toUpperCase() + plan.appSupport.slice(1)} support`,
    checked: true,
    icon: <Icons.help className="size-4" />,
  },
  {
    text: "Open API Access",
    checked: plan.appApiAccess,
    icon: <Icons.unplug className="size-4" />,
  },
];

const Benefit = ({ text, checked, icon }: BenefitType) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-5 place-content-center">{icon}</span>
      ) : (
        <span className="grid size-5 place-content-center rounded-full bg-zinc-200 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          <X className="h-3 w-3" />
        </span>
      )}
      <span className="text-sm text-neutral-600 dark:text-zinc-300">
        {text}
      </span>
    </div>
  );
};

const Card = ({ className, children, style = {} }: { className?: string; children: React.ReactNode; style?: any }) => {
  return (
    <motion.div
      initial={{
        filter: "blur(2px)",
      }}
      whileInView={{
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
        delay: 0.25,
      }}
      style={style}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50/50 to-zinc-100/80 p-6 dark:border-zinc-700 dark:from-zinc-950/50 dark:to-zinc-900/80",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

type PriceCardProps = {
  tier: string;
  price: string;
  bestFor: string;
  CTA: React.ReactNode;
  benefits: BenefitType[];
};

const PriceCard = ({ tier, price, bestFor, CTA, benefits }: PriceCardProps) => {
  return (
    <Card>
      <div className="flex flex-col items-center border-b border-zinc-200 pb-6 dark:border-zinc-700">
        <span className="mb-6 inline-block text-zinc-800 dark:text-zinc-50">
          {tier.toUpperCase()}
        </span>
        <span className="mb-3 inline-block text-4xl font-medium text-zinc-900 dark:text-zinc-100">
          {price}
        </span>
        <span className="bg-gradient-to-br from-zinc-700 to-zinc-900 bg-clip-text text-center text-transparent dark:from-zinc-200 dark:to-zinc-500">
          {bestFor}
        </span>
      </div>

      <div className="space-y-3 py-9">
        {benefits.map((b, i) => (
          <Benefit {...b} key={i} />
        ))}
      </div>

      {CTA}
    </Card>
  );
};

export default function UpgradePage() {
  const { data: plans, isLoading } = useSWR<{ list: PlanQuotaFormData[] }>(
    "/api/plan?all=1",
    (url) => fetcher(url).then(res => ({
        ...res,
        list: res.list.sort((a: any, b: any) => Number(a.price) - Number(b.price))
    }))
  );
  const { toast } = useToast();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(1);

  const handleUpgrade = async (plan: PlanQuotaFormData) => {
    if (!plan.id) return;
    setLoadingPlanId(plan.id);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, duration }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading plans...</div>;

  return (
    <div className="container py-10">
      <h1 className="mb-4 text-center text-3xl font-bold">Upgrade Your Plan</h1>
      
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-lg border bg-card p-1 text-card-foreground shadow-sm">
            {[1, 3, 6, 12].map((d) => (
                <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                        duration === d 
                            ? "bg-background text-foreground shadow" 
                            : "hover:bg-muted hover:text-muted-foreground"
                    )}
                >
                    {d} Month{d > 1 ? 's' : ''}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans?.list.map((plan) => (
          <PriceCard
            key={plan.id}
            tier={plan.name}
            price={Number(plan.price) > 0 ? `${(Number(plan.price) * duration).toFixed(2)} USDT` : "Free"}
            bestFor={`For ${duration} month${duration > 1 ? 's' : ''}`}
            benefits={getBenefits(plan)}
            CTA={
              <Button
                className="mt-6 w-full"
                onClick={() => handleUpgrade(plan)}
                disabled={loadingPlanId === plan.id || Number(plan.price) <= 0}
                variant={Number(plan.price) <= 0 ? "outline" : "default"}
              >
                {loadingPlanId === plan.id
                  ? "Processing..."
                  : Number(plan.price) > 0
                    ? "Pay with USDT"
                    : "Free Plan"}
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}
