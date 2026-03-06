export default function StatsAlt() {
  return (
    <section className="relative overflow-hidden py-10">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="rounded-2xl border border-neutral-700 bg-neutral-900/60 p-8 text-center shadow-sm backdrop-blur-md">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatItem value="10K+" label="Short URLs created" />
            <StatItem value="50K+" label="Emails processed" />
            <StatItem value="1M+" label="API requests" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-4xl font-black text-transparent">
        {value}
      </div>
      <div className="mt-1 text-sm text-neutral-300">{label}</div>
    </div>
  );
}
