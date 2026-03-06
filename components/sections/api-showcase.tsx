import Link from "next/link";
import { Icons } from "@/components/shared/icons";

export default function ApiShowcase() {
  return (
    <section className="relative overflow-hidden py-10">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white">Open APIs</h2>
          <p className="mt-2 text-neutral-300">
            Integrate Temp Email, Temp Gmail and Short URLs into your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ApiItem
            title="Temp Gmail API"
            desc="List, unread, message content, attachments"
            link="/docs/gmail"
            icon={<Icons.mailPlus className="size-5" />}
          />
          <ApiItem
            title="Short URLs API"
            desc="Create/update short links programmatically"
            link="/docs/short-urls"
            icon={<Icons.link className="size-5" />}
          />
          <ApiItem
            title="QR Code API"
            desc="Generate QR codes for any URL"
            link="/docs/open-api/qrcode"
            icon={<Icons.qrcode className="size-5" />}
          />
        </div>
      </div>
    </section>
  );
}

function ApiItem({
  title,
  desc,
  link,
  icon,
}: {
  title: string;
  desc: string;
  link: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 text-left shadow-sm backdrop-blur-md transition-all hover:border-neutral-500">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <p className="text-neutral-300">{desc}</p>
      <div className="mt-4 text-sm">
        <Link href={link} className="underline">
          View Docs
        </Link>
      </div>
    </div>
  );
}
