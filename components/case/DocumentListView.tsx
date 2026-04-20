import { DocumentItem } from "@/app/cases/[id]/page";

type Props = {
  documents: DocumentItem[];
};

export default function DocumentListView({ documents }: Props) {
  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No documents match these filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              File
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Provider
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Facility
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pages
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Events
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm text-slate-800">{doc.fileName}</td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {doc.documentType || "Unknown"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {doc.provider || "Unknown"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {doc.facility || "Unknown"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {doc.pageCount ?? "-"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {doc.extractedEventsCount ?? "-"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {doc.status || "Unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}