import { Dispatch, SetStateAction } from "react";

type Filters = {
  search: string;
  documentTypes: string[];
  providers: string[];
  facilities: string[];
  eventTypes: string[];
  showOnlyKeyEvents: boolean;
  hideLowConfidence: boolean;
};

type Props = {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  availableDocumentTypes: string[];
  availableProviders: string[];
  availableFacilities: string[];
  availableEventTypes: string[];
};

type FilterListProps = {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

function FilterList({ title, items, selected, onToggle }: FilterListProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-800">{title}</p>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No options yet</p>
        ) : (
          items.map((item) => {
            const checked = selected.includes(item);

            return (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>{item}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function toggleInArray(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

export default function FilterSidebar({
  filters,
  setFilters,
  availableDocumentTypes,
  availableProviders,
  availableFacilities,
  availableEventTypes,
}: Props) {
  return (
    <aside className="sticky top-6 h-fit w-[280px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Filter Records</h2>
        <p className="mt-1 text-sm text-slate-500">
          Narrow the view to the details that matter.
        </p>
      </div>

      <div className="space-y-6">
        <FilterList
          title="Document Type"
          items={availableDocumentTypes}
          selected={filters.documentTypes}
          onToggle={(value) =>
            setFilters((prev) => ({
              ...prev,
              documentTypes: toggleInArray(prev.documentTypes, value),
            }))
          }
        />

        <FilterList
          title="Providers"
          items={availableProviders}
          selected={filters.providers}
          onToggle={(value) =>
            setFilters((prev) => ({
              ...prev,
              providers: toggleInArray(prev.providers, value),
            }))
          }
        />

        <FilterList
          title="Facilities"
          items={availableFacilities}
          selected={filters.facilities}
          onToggle={(value) =>
            setFilters((prev) => ({
              ...prev,
              facilities: toggleInArray(prev.facilities, value),
            }))
          }
        />

        <FilterList
          title="Categories"
          items={availableEventTypes}
          selected={filters.eventTypes}
          onToggle={(value) =>
            setFilters((prev) => ({
              ...prev,
              eventTypes: toggleInArray(prev.eventTypes, value),
            }))
          }
        />

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.showOnlyKeyEvents}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  showOnlyKeyEvents: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            <span>Show only key events</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.hideLowConfidence}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  hideLowConfidence: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            <span>Hide low-confidence items</span>
          </label>
        </div>

        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              documentTypes: [],
              providers: [],
              facilities: [],
              eventTypes: [],
              showOnlyKeyEvents: false,
              hideLowConfidence: false,
            }))
          }
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Clear filters
        </button>
      </div>
    </aside>
  );
}