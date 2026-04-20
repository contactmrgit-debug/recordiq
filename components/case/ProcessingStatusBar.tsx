type Props = {
  documentCount: number;
  eventCount: number;
  status: string;
};

export default function ProcessingStatusBar({
  documentCount,
  eventCount,
  status,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{status}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-400">Documents</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{documentCount}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-400">Timeline Events</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{eventCount}</p>
      </div>
    </div>
  );
}