 "use client";
 
 import Link from "next/link";
 import { useState } from "react";
 import { CreditCard, Heart, Mail, Wallet } from "lucide-react";
 
 import { Button } from "@/components/ui/button";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from "@/components/ui/dialog";
 import { CopyButton } from "@/components/shared/copy-button";
 
 export default function FloatingDonate() {
   const [open, setOpen] = useState(false);
  const contactTelegramUrl = "https://t.me/blackpink2812";
  const telegramGroupUrl = "https://t.me/mail1snet";
  const vnBankQrUrl = "https://api.web2m.com/quicklink/ACB/9801/Pham%20Thanh%20Dat?amount=&memo=&is_mask=0&bg=15";
  const binance = "taodeovao";
  const usdtTrc20 = "TL1DofZHyp3GGrxRM1D6zjiF2GUm9TfVjA";
  const binanceQrUrl = "https://i.postimg.cc/gJXfYqJV/3.png";
 
   return (
     <>
       <Button
        className="fixed right-6 top-1/2 z-50 -translate-y-1/2 rounded-full px-5 py-2.5 shadow-xl ring-2 ring-blue-300/70 transition-all hover:scale-105 hover:shadow-2xl dark:ring-blue-500/40"
         onClick={() => setOpen(true)}
         variant="blue"
       >
        <span className="relative mr-2 grid size-5 place-items-center">
          <span className="absolute inset-0 rounded-full bg-white/30 blur-[2px]" />
          <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
          <Heart className="relative size-4" />
        </span>
         Donate
       </Button>
 
       <Dialog open={open} onOpenChange={setOpen}>
         <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-white">
                 <Heart className="size-5" />
                 Donate
               </DialogTitle>
               <DialogDescription className="text-white/80">
                Thank you for supporting! Every donation helps keep the project running.
               </DialogDescription>
             </DialogHeader>
           </div>
 
           <div className="space-y-3 p-6">
            <div className="relative rounded-xl border bg-background p-4">
              <CopyButton
                value={contactTelegramUrl}
                className="absolute right-3 top-3 size-8 rounded-md bg-muted/40 hover:bg-muted/60"
              />
              <div className="flex items-start gap-3 pr-12">
                <span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Mail className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Contact (Telegram)</div>
                  <Link
                    href={contactTelegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm font-medium text-blue-600 underline underline-offset-4"
                  >
                    {contactTelegramUrl}
                  </Link>
                </div>
              </div>
             </div>
 
             <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative rounded-xl border bg-background p-4">
                <CopyButton
                  value={vnBankQrUrl}
                  className="absolute right-3 top-3 size-8 rounded-md bg-muted/40 hover:bg-muted/60"
                />
                <div className="flex items-start gap-3 pr-12">
                  <span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <CreditCard className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">VN Bank QR (ACB)</div>
                    <div className="truncate text-sm text-muted-foreground">Scan to pay</div>
                  </div>
                </div>
                <div className="mt-3 overflow-hidden rounded-lg border bg-muted/10">
                  <a href={vnBankQrUrl} target="_blank" rel="noreferrer">
                    <img
                      src={vnBankQrUrl}
                      alt="VN Bank QR Code"
                      className="h-auto w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </a>
                </div>
               </div>
 
              <div className="relative rounded-xl border bg-background p-4">
                <CopyButton
                  value={binance}
                  className="absolute right-3 top-3 size-8 rounded-md bg-muted/40 hover:bg-muted/60"
                />
                <div className="flex items-start gap-3 pr-12">
                  <span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                    <Wallet className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Binance</div>
                    <div className="truncate font-mono text-sm text-muted-foreground">{binance}</div>
                  </div>
                </div>
                <div className="mt-3 overflow-hidden rounded-lg border bg-muted/10">
                  <img
                    src={binanceQrUrl}
                    alt="Binance QR Code"
                    className="h-auto w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
               </div>
             </div>
 
            <div className="relative rounded-xl border bg-background p-4">
              <CopyButton
                value={usdtTrc20}
                className="absolute right-3 top-3 size-8 rounded-md bg-muted/40 hover:bg-muted/60"
              />
              <div className="flex items-start gap-3 pr-12">
                <span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Wallet className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">USDT (TRC20)</div>
                  <div className="break-all font-mono text-sm text-muted-foreground">{usdtTrc20}</div>
                </div>
              </div>
             </div>
 
             <div className="rounded-xl border bg-background p-4">
              <div className="text-sm font-semibold">Telegram Group</div>
               <Link
                href={telegramGroupUrl}
                 target="_blank"
                rel="noreferrer"
                 className="break-all text-sm font-medium text-blue-600 underline underline-offset-4"
               >
                {telegramGroupUrl}
               </Link>
             </div>
           </div>
 
           <div className="flex justify-end gap-2 border-t bg-muted/20 px-6 py-4">
             <Button variant="outline" onClick={() => setOpen(false)}>
              Close
             </Button>
           </div>
         </DialogContent>
       </Dialog>
     </>
   );
 }
