import { TimelineEventItem } from "@/app/cases/[id]/page";

type Props = {
  groupedEvents: [string, TimelineEventItem[]][];
  selectedEventId: string | null;
  onSelectEvent: (event: TimelineEventItem) => void;
};

export default function OutlineListView({
  groupedEvents,
  selectedEventId,
  onSelectEvent,
}: Props) {
  if (groupedEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No events match these filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map(([dateLabel, items]) => (
        <div key={dateLabel} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {dateLabel}
          </h3>

          <div className="space-y-2">
            {items.map((event) => (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  selectedEventId === event.id
                    ? "bg-emerald-100"
                    : "bg-white hover:bg-slate-100"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{event.title}</span>
                  {event.eventType ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {event.eventType}
                    </span>
                  ) : null}
                </div>

                {event.description ? (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {event.description}
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}