export function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="rounded-lg border border-rudra/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-ink/55">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-saffron">{note}</p>
    </div>
  );
}
