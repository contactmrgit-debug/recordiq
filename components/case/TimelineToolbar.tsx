import { DisplayMode } from "@/app/cases/[id]/page";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  displayMode: DisplayMode;
  setDisplayMode: (value: DisplayMode) => void;
  resultCount: number;
};

export default function TimelineToolbar({
  search,
  onSearchChange,
  sortBy,
  setSortBy,
  displayMode,
  setDisplayMode,
  resultCount,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records, providers, diagnoses, dates..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />

          <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
            {resultCount} results
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
          >
            <option>Newest first</option>
            <option>Oldest first</option>
            <option>Provider</option>
            <option>Document type</option>
          </select>

          <select
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
          >
            <option value="TIMELINE">Timeline</option>
            <option value="OUTLINE">Outline</option>
            <option value="DOCUMENTS">Documents</option>
          </select>

          <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}