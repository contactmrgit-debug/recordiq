type Props = {
  caseTitle: string;
  subjectName?: string;
  caseStatus: string;
  caseId: string;
};

function statusClasses(status: string) {
  const value = status.toLowerCase();

  if (value.includes("process")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (value.includes("ready") || value.includes("processed")) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function CaseHeader({
  caseTitle,
  subjectName,
  caseStatus,
  caseId,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            RecordIQ Case Review
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {caseTitle}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {subjectName ? <span>Subject: {subjectName}</span> : null}
            <span>Case ID: {caseId}</span>
          </div>
        </div>

        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusClasses(
            caseStatus
          )}`}
        >
          {caseStatus}
        </div>
      </div>
    </div>
  );
}