type TimelineEventItem = {
  id: string;
  eventDate: string;
  title: string;
  description: string | null;
  eventType: string | null;
  provider?: string | null;
  facility?: string | null;
  documentType?: string | null;
  documentName?: string | null;
  pageNumber?: number | null;
  isHidden?: boolean;
  confidence?: number | null;
};

type Props = {
  selectedEvent: TimelineEventItem | null;
  onClose: () => void;
};

export default function EventDetailPanel({
  selectedEvent,
  onClose,
}: Props) {
  return (
    <aside className="sticky top-6 h-[calc(100vh-48px)] w-[390px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {!selectedEvent ? (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div>
            <p className="text-base font-semibold text-slate-800">
              Select an event
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Click any timeline item to view fuller details, source context,
              and record metadata.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-slate-100 p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Event Details
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {selectedEvent.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Date</p>
                <p className="mt-1 text-sm text-slate-800">{selectedEvent.eventDate}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Type</p>
                <p className="mt-1 text-sm text-slate-800">
                  {selectedEvent.eventType || "Unspecified"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Summary</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {selectedEvent.description || "No summary available."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Provider</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {selectedEvent.provider || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Facility</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {selectedEvent.facility || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Document Type</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {selectedEvent.documentType || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Source Document</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {selectedEvent.documentName || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Page Number</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {selectedEvent.pageNumber ?? "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Confidence</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {selectedEvent.confidence != null
                      ? `${Math.round(selectedEvent.confidence * 100)}%`
                      : "Not shown"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Open document
              </button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Edit event
              </button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Hide event
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}