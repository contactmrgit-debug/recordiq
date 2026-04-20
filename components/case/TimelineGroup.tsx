import { TimelineEventItem } from "@/app/cases/[id]/page";
import TimelineCard from "@/components/case/TimelineCard";

type Props = {
  groupedEvents: [string, TimelineEventItem[]][];
  selectedEventId: string | null;
  onSelectEvent: (event: TimelineEventItem) => void;
};

export default function TimelineGroup({
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
    <div className="space-y-8">
      {groupedEvents.map(([dateLabel, items]) => (
        <section key={dateLabel}>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {dateLabel}
            </h3>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-4">
            {items.map((event) => (
              <TimelineCard
                key={event.id}
                event={event}
                selected={selectedEventId === event.id}
                onClick={() => onSelectEvent(event)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}