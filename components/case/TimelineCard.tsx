import { TimelineEventItem } from "@/app/cases/[id]/page";

type Props = {
  event: TimelineEventItem;
  selected?: boolean;
  onClick: () => void;
};

function badgeColor(type?: string | null) {
  const value = (type || "").toLowerCase();

  if (value === "lab") return "bg-cyan-100 text-cyan-700";
  if (value === "imaging") return "bg-violet-100 text-violet-700";
  if (value === "treatment") return "bg-emerald-100 text-emerald-700";
  if (value === "diagnosis") return "bg-rose-100 text-rose-700";
  if (value === "appointment") return "bg-amber-100 text-amber-700";
  if (value === "billing") return "bg-slate-200 text-slate-700";

  return "bg-slate-100 text-slate-700";
}

export default function TimelineCard({ event, selected = false, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-5 text-left shadow-sm transition ${
        selected
          ? "border-emerald-300 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {event.eventType ? (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeColor(
                  event.eventType
                )}`}
              >
                {event.eventType}
              </span>
            ) : null}

            {event.documentType ? (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {event.documentType}
              </span>
            ) : null}
          </div>

          <h4 className="text-lg font-semibold text-slate-900">{event.title}</h4>

          {event.description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {event.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            {event.provider ? <span>Provider: {event.provider}</span> : null}
            {event.facility ? <span>Facility: {event.facility}</span> : null}
            {event.documentName ? <span>Source: {event.documentName}</span> : null}
            {event.pageNumber ? <span>Page: {event.pageNumber}</span> : null}
          </div>
        </div>

        <div className="text-xs text-slate-400">View</div>
      </div>
    </button>
  );
}