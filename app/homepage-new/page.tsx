import Image from "next/image";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
];

const problemRows = [
  {
    title: "Records arrive out of order",
    copy: "Emergency notes, consults, imaging reports, and correspondence often land in different batches with no reliable chronology.",
  },
  {
    title: "Key events get buried",
    copy: "The detail that matters most is usually hidden inside long scans, duplicate pages, or handwritten sections.",
  },
  {
    title: "Source pages are hard to verify",
    copy: "Teams need a clear path from each event back to the original page before they can trust the record.",
  },
];

const workflowSteps = [
  {
    step: "Upload",
    title: "Bring in the record packet",
    copy: "Start with PDFs or mixed packet uploads and keep the original source intact.",
  },
  {
    step: "Extract",
    title: "Capture events and dates",
    copy: "Relevant encounters, treatments, filings, and notes are organized into an initial chronology.",
  },
  {
    step: "Verify",
    title: "Trace each item to a source page",
    copy: "Every event remains tied to the originating page so review stays defensible.",
  },
  {
    step: "Export",
    title: "Hand off a clean chronology",
    copy: "Deliver a case-ready timeline for internal review, case strategy, or downstream reporting.",
  },
];

const useCases = [
  {
    title: "Legal teams",
    copy: "Build faster chronology reviews for matters with dense medical, billing, or claim records.",
  },
  {
    title: "Medical reviewers",
    copy: "Understand patient history without losing the chain of care across dozens of reports.",
  },
  {
    title: "Claims teams",
    copy: "Separate signal from noise and keep verification anchored to source pages.",
  },
];

const securityItems = [
  "Privacy-first workflows",
  "Encrypted storage design",
  "HIPAA-aligned operations",
];

const mockTimeline = [
  {
    date: "May 2, 2026",
    items: [
      { time: "8:10 AM", text: "ER intake note", page: "p. 12" },
      { time: "11:45 AM", text: "Radiology impression", page: "p. 18" },
    ],
  },
  {
    date: "May 5, 2026",
    items: [
      { time: "9:00 AM", text: "Specialist consult", page: "p. 23" },
      { time: "3:25 PM", text: "Follow-up treatment", page: "p. 27" },
    ],
  },
  {
    date: "May 9, 2026",
    items: [{ time: "1:15 PM", text: "Claim review note", page: "p. 34" }],
  },
];

export default function HomepageNewPage() {
  return (
    <main className="vera-page">
      <style>{`
        :root {
          --vera-bg: #f6f8fc;
          --vera-surface: #ffffff;
          --vera-ink: #08172f;
          --vera-subtle: #50617b;
          --vera-border: #dce6f4;
          --vera-blue: #1f5eff;
          --vera-blue-deep: #0a2d68;
          --vera-blue-soft: #e9f0ff;
          --vera-navy: #071a3a;
          --vera-navy-2: #0d2b59;
          --vera-shadow: 0 22px 60px rgba(15, 36, 74, 0.12);
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: var(--vera-bg);
          color: var(--vera-ink);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .vera-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(31, 94, 255, 0.12), transparent 28%),
            radial-gradient(circle at 80% 12%, rgba(10, 45, 104, 0.08), transparent 22%),
            var(--vera-bg);
        }

        .vera-shell {
          width: min(1240px, calc(100% - 40px));
          margin: 0 auto;
        }

        .vera-header {
          position: sticky;
          top: 0;
          z-index: 30;
          backdrop-filter: blur(14px);
          background: rgba(246, 248, 252, 0.86);
          border-bottom: 1px solid rgba(220, 230, 244, 0.72);
        }

        .vera-header-inner {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .vera-brand {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .vera-logo {
          display: block;
          width: 168px;
          height: auto;
          object-fit: contain;
        }

        .vera-nav {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .vera-nav a {
          font-size: 14px;
          font-weight: 600;
          color: var(--vera-subtle);
          transition: color 160ms ease;
        }

        .vera-nav a:hover {
          color: var(--vera-ink);
        }

        .vera-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }

        .vera-btn:hover {
          transform: translateY(-1px);
        }

        .vera-btn-primary {
          background: linear-gradient(180deg, #2d6bff 0%, #1c55e1 100%);
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(31, 94, 255, 0.18);
        }

        .vera-btn-ghost {
          border-color: var(--vera-border);
          background: rgba(255, 255, 255, 0.72);
          color: var(--vera-ink);
        }

        .vera-section {
          padding: 86px 0;
        }

        .vera-hero {
          padding-top: 40px;
        }

        .vera-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 40px;
          align-items: center;
        }

        .vera-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(220, 230, 244, 0.95);
          color: var(--vera-blue-deep);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .vera-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--vera-blue);
          box-shadow: 0 0 0 5px rgba(31, 94, 255, 0.12);
        }

        .vera-hero h1 {
          margin: 20px 0 16px;
          max-width: 13ch;
          font-size: clamp(3rem, 6vw, 5.35rem);
          line-height: 0.95;
          letter-spacing: -0.05em;
          color: var(--vera-navy);
        }

        .vera-hero p {
          margin: 0;
          max-width: 56ch;
          font-size: 18px;
          line-height: 1.7;
          color: var(--vera-subtle);
        }

        .vera-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
        }

        .vera-hero-notes {
          display: flex;
          flex-wrap: wrap;
          gap: 14px 18px;
          margin-top: 22px;
          color: var(--vera-subtle);
          font-size: 13px;
        }

        .vera-hero-notes span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .vera-hero-notes i {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(31, 94, 255, 0.72);
          display: inline-block;
        }

        .vera-visual {
          position: relative;
          padding: 22px;
          border-radius: 30px;
          background:
            linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(247, 250, 255, 0.96) 100%);
          border: 1px solid rgba(220, 230, 244, 0.92);
          box-shadow: var(--vera-shadow);
          overflow: hidden;
        }

        .vera-visual::before {
          content: "";
          position: absolute;
          inset: auto -20% -35% auto;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(31, 94, 255, 0.18), transparent 68%);
          pointer-events: none;
        }

        .vera-blocks {
          display: grid;
          gap: 16px;
        }

        .vera-block {
          position: relative;
          display: grid;
          gap: 12px;
          padding: 18px;
          border-radius: 22px;
          border: 1px solid rgba(220, 230, 244, 0.88);
          background: #ffffff;
        }

        .vera-block.dark {
          background: linear-gradient(180deg, #081a3b 0%, #0f2b63 100%);
          color: #ffffff;
          border-color: rgba(111, 142, 198, 0.28);
        }

        .vera-block-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .vera-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border-radius: 999px;
          background: var(--vera-blue-soft);
          color: var(--vera-blue-deep);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .vera-pill.dark {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .vera-mini-meta {
          font-size: 12px;
          color: inherit;
          opacity: 0.78;
          font-weight: 700;
        }

        .vera-line-list {
          display: grid;
          gap: 10px;
        }

        .vera-line-row {
          display: grid;
          grid-template-columns: 84px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(246, 248, 252, 0.92);
          color: var(--vera-ink);
          font-size: 13px;
          font-weight: 600;
        }

        .vera-block.dark .vera-line-row {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .vera-line-page {
          color: var(--vera-blue-deep);
          font-size: 12px;
          font-weight: 800;
        }

        .vera-block.dark .vera-line-page {
          color: rgba(255, 255, 255, 0.85);
        }

        .vera-connector {
          width: 2px;
          height: 16px;
          margin: 0 auto;
          background: linear-gradient(180deg, rgba(31, 94, 255, 0.6), rgba(31, 94, 255, 0.14));
          border-radius: 999px;
        }

        .vera-problem-grid {
          display: grid;
          gap: 14px;
        }

        .vera-problem-row {
          display: grid;
          grid-template-columns: 300px 1fr auto;
          gap: 20px;
          align-items: center;
          padding: 20px 24px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(220, 230, 244, 0.92);
          box-shadow: 0 12px 28px rgba(15, 36, 74, 0.05);
        }

        .vera-problem-row h3 {
          margin: 0;
          font-size: 20px;
          line-height: 1.15;
          color: var(--vera-navy);
        }

        .vera-problem-row p {
          margin: 0;
          color: var(--vera-subtle);
          line-height: 1.7;
        }

        .vera-problem-tag {
          justify-self: end;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--vera-blue-deep);
          font-size: 13px;
          font-weight: 800;
        }

        .vera-problem-tag::before {
          content: "";
          width: 38px;
          height: 1px;
          background: linear-gradient(90deg, rgba(31, 94, 255, 0.08), rgba(31, 94, 255, 0.85));
          display: inline-block;
        }

        .vera-workflow {
          background:
            linear-gradient(180deg, rgba(7, 26, 58, 0.98), rgba(13, 43, 89, 0.98)),
            var(--vera-navy);
          color: #ffffff;
        }

        .vera-workflow h2,
        .vera-preview h2,
        .vera-usecases h2,
        .vera-security h2,
        .vera-final h2,
        .vera-problem h2 {
          margin: 0 0 14px;
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .vera-workflow .vera-section-copy,
        .vera-preview .vera-section-copy,
        .vera-usecases .vera-section-copy,
        .vera-security .vera-section-copy,
        .vera-problem .vera-section-copy {
          margin: 0;
          max-width: 62ch;
          font-size: 17px;
          line-height: 1.7;
          color: inherit;
          opacity: 0.82;
        }

        .vera-rail {
          margin-top: 36px;
          display: grid;
          gap: 20px;
          position: relative;
        }

        .vera-rail::before {
          content: "";
          position: absolute;
          left: 33px;
          top: 16px;
          bottom: 16px;
          width: 2px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(31, 94, 255, 0.85), rgba(255, 255, 255, 0.18));
        }

        .vera-step {
          display: grid;
          grid-template-columns: 84px 1fr;
          gap: 24px;
          align-items: start;
        }

        .vera-step:nth-child(even) {
          transform: translateX(28px);
        }

        .vera-step-marker {
          position: relative;
          z-index: 1;
          width: 68px;
          height: 68px;
          border-radius: 22px;
          background: linear-gradient(180deg, #2f71ff 0%, #1a56e1 100%);
          display: grid;
          place-items: center;
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          box-shadow: 0 18px 34px rgba(31, 94, 255, 0.24);
        }

        .vera-step-card {
          padding: 18px 20px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }

        .vera-step-card h3 {
          margin: 0 0 8px;
          font-size: 20px;
          color: #ffffff;
        }

        .vera-step-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.7;
        }

        .vera-preview-layout {
          margin-top: 34px;
          display: grid;
          grid-template-columns: 1.02fr 0.98fr;
          gap: 18px;
        }

        .vera-preview-card {
          border-radius: 26px;
          background: #ffffff;
          border: 1px solid rgba(220, 230, 244, 0.96);
          box-shadow: var(--vera-shadow);
          overflow: hidden;
        }

        .vera-preview-topbar {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          padding: 18px 20px;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
          border-bottom: 1px solid rgba(220, 230, 244, 0.9);
        }

        .vera-summary {
          display: grid;
          gap: 4px;
        }

        .vera-summary strong {
          font-size: 16px;
          color: var(--vera-navy);
        }

        .vera-summary span {
          font-size: 13px;
          color: var(--vera-subtle);
        }

        .vera-export {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          background: var(--vera-navy);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
        }

        .vera-preview-body {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          min-height: 560px;
        }

        .vera-timeline-pane {
          padding: 22px 18px 20px;
          background:
            linear-gradient(180deg, rgba(248, 251, 255, 0.94) 0%, rgba(255, 255, 255, 1) 100%);
          border-right: 1px solid rgba(220, 230, 244, 0.9);
        }

        .vera-pane-title {
          margin: 0 0 16px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--vera-subtle);
          font-weight: 800;
        }

        .vera-group {
          display: grid;
          gap: 10px;
          margin-bottom: 18px;
        }

        .vera-date {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 800;
          color: var(--vera-navy);
        }

        .vera-date::before {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--vera-blue);
          box-shadow: 0 0 0 4px rgba(31, 94, 255, 0.12);
        }

        .vera-event {
          padding: 12px 13px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid rgba(220, 230, 244, 0.95);
        }

        .vera-event-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .vera-event-top strong {
          font-size: 14px;
          color: var(--vera-ink);
        }

        .vera-event-top span {
          font-size: 12px;
          font-weight: 800;
          color: var(--vera-blue-deep);
        }

        .vera-event p {
          margin: 0;
          font-size: 12px;
          line-height: 1.5;
          color: var(--vera-subtle);
        }

        .vera-source-pane {
          display: grid;
          grid-template-rows: auto 1fr;
          background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
        }

        .vera-source-head {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
          padding: 18px 18px 0;
        }

        .vera-source-head strong {
          font-size: 14px;
          color: var(--vera-navy);
        }

        .vera-source-head span {
          font-size: 12px;
          color: var(--vera-subtle);
        }

        .vera-document {
          margin: 16px 18px 18px;
          border-radius: 22px;
          border: 1px solid rgba(220, 230, 244, 0.95);
          background:
            linear-gradient(180deg, #ffffff 0%, #f4f7fd 100%);
          overflow: hidden;
          position: relative;
        }

        .vera-document::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(transparent 95%, rgba(97, 125, 165, 0.14) 96%),
            linear-gradient(90deg, transparent 95%, rgba(97, 125, 165, 0.08) 96%);
          background-size: 100% 28px, 28px 100%;
          pointer-events: none;
        }

        .vera-document-body {
          position: relative;
          padding: 20px;
          min-height: 500px;
          display: grid;
          gap: 16px;
        }

        .vera-doc-bar {
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(31, 94, 255, 0.18), rgba(31, 94, 255, 0.04));
        }

        .vera-doc-bar.short {
          width: 68%;
        }

        .vera-doc-bar.mid {
          width: 84%;
        }

        .vera-doc-block {
          display: grid;
          gap: 10px;
          padding: 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(220, 230, 244, 0.85);
          margin-top: 10px;
        }

        .vera-doc-block .vera-doc-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 12px;
          color: var(--vera-subtle);
        }

        .vera-doc-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          background: var(--vera-blue-soft);
          color: var(--vera-blue-deep);
          font-size: 12px;
          font-weight: 800;
          width: fit-content;
        }

        .vera-doc-highlight {
          padding: 10px 12px;
          border-left: 3px solid var(--vera-blue);
          background: rgba(31, 94, 255, 0.06);
          color: var(--vera-ink);
          font-size: 13px;
          line-height: 1.6;
        }

        .vera-usecases-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 32px;
        }

        .vera-usecase {
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(220, 230, 244, 0.92);
          box-shadow: 0 12px 26px rgba(15, 36, 74, 0.05);
        }

        .vera-usecase .vera-icon {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
          background: linear-gradient(180deg, #edf3ff 0%, #dbe8ff 100%);
          color: var(--vera-blue-deep);
          font-weight: 900;
        }

        .vera-usecase h3 {
          margin: 0 0 10px;
          font-size: 20px;
          color: var(--vera-navy);
        }

        .vera-usecase p {
          margin: 0;
          color: var(--vera-subtle);
          line-height: 1.7;
        }

        .vera-security-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .vera-pricing-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .vera-pricing-card {
          padding: 24px;
          border-radius: 24px;
          background: linear-gradient(180deg, #ffffff 0%, #f4f7fd 100%);
          border: 1px solid rgba(220, 230, 244, 0.96);
          box-shadow: 0 12px 26px rgba(15, 36, 74, 0.05);
        }

        .vera-pricing-card h3 {
          margin: 0 0 10px;
          font-size: 18px;
          color: var(--vera-navy);
        }

        .vera-pricing-card p {
          margin: 0;
          color: var(--vera-subtle);
          line-height: 1.7;
        }

        .vera-pricing-badge {
          display: inline-flex;
          align-items: center;
          padding: 7px 10px;
          border-radius: 999px;
          background: var(--vera-blue-soft);
          color: var(--vera-blue-deep);
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .vera-security-item {
          padding: 22px;
          border-radius: 22px;
          background: linear-gradient(180deg, #ffffff 0%, #f5f8fe 100%);
          border: 1px solid rgba(220, 230, 244, 0.96);
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 10px 24px rgba(15, 36, 74, 0.04);
        }

        .vera-security-mark {
          width: 48px;
          height: 48px;
          border-radius: 18px;
          background: linear-gradient(180deg, #0c2f6a 0%, #081b3d 100%);
          color: #ffffff;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          box-shadow: 0 12px 24px rgba(7, 26, 58, 0.16);
        }

        .vera-security-item strong {
          display: block;
          font-size: 15px;
          color: var(--vera-ink);
          margin-bottom: 4px;
        }

        .vera-security-item span {
          display: block;
          font-size: 13px;
          line-height: 1.55;
          color: var(--vera-subtle);
        }

        .vera-final {
          padding-top: 28px;
        }

        .vera-final-band {
          padding: 32px;
          border-radius: 30px;
          background: linear-gradient(135deg, #071a3a 0%, #0d2b59 55%, #1f5eff 100%);
          color: #ffffff;
          box-shadow: var(--vera-shadow);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .vera-final-band p {
          margin: 0;
          max-width: 56ch;
          color: rgba(255, 255, 255, 0.84);
          line-height: 1.7;
          font-size: 17px;
        }

        .vera-footer-spacer {
          height: 34px;
        }

        @media (max-width: 1080px) {
          .vera-hero-grid,
          .vera-preview-layout {
            grid-template-columns: 1fr;
          }

          .vera-usecases-grid,
          .vera-security-grid,
          .vera-pricing-grid {
            grid-template-columns: 1fr;
          }

          .vera-step:nth-child(even) {
            transform: none;
          }

          .vera-final-band {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 860px) {
          .vera-header-inner {
            flex-wrap: wrap;
            justify-content: center;
            padding: 14px 0;
          }

          .vera-nav {
            gap: 18px;
          }

          .vera-hero h1 {
            max-width: none;
          }

          .vera-problem-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .vera-problem-tag {
            justify-self: start;
          }

          .vera-step {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .vera-rail::before {
            left: 31px;
          }

          .vera-preview-body {
            grid-template-columns: 1fr;
          }

          .vera-timeline-pane {
            border-right: none;
            border-bottom: 1px solid rgba(220, 230, 244, 0.9);
          }

          .vera-document-body {
            min-height: 420px;
          }

          .vera-line-row {
            grid-template-columns: 72px 1fr auto;
          }
        }

        @media (max-width: 640px) {
          .vera-shell {
            width: min(100% - 24px, 1240px);
          }

          .vera-section {
            padding: 64px 0;
          }

          .vera-hero {
            padding-top: 24px;
          }

          .vera-hero p,
          .vera-workflow .vera-section-copy,
          .vera-preview .vera-section-copy,
          .vera-usecases .vera-section-copy,
          .vera-security .vera-section-copy,
          .vera-pricing .vera-section-copy,
          .vera-problem .vera-section-copy,
          .vera-final-band p {
            font-size: 16px;
          }

          .vera-visual,
          .vera-preview-card,
          .vera-usecase,
          .vera-security-item,
          .vera-final-band {
            border-radius: 22px;
          }

          .vera-block,
          .vera-event,
          .vera-document-body {
            padding-left: 14px;
            padding-right: 14px;
          }

          .vera-preview-topbar,
          .vera-source-head {
            padding-left: 14px;
            padding-right: 14px;
          }

          .vera-document {
            margin-left: 14px;
            margin-right: 14px;
          }

          .vera-problem-row,
          .vera-usecase,
          .vera-security-item {
            padding: 18px;
          }
        }
      `}</style>

      <header className="vera-header">
        <div className="vera-shell vera-header-inner">
          <a className="vera-brand" href="#" aria-label="VeraChron home">
            <Image
              className="vera-logo"
              src="/logo/verachron-logo.png"
              alt="VeraChron"
              width={240}
              height={72}
              priority
            />
          </a>

          <nav className="vera-nav" aria-label="Primary">
            {navItems.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className="vera-btn vera-btn-primary" href="#final">
            Start Timeline
          </a>
        </div>
      </header>

      <section className="vera-section vera-hero">
        <div className="vera-shell vera-hero-grid">
          <div>
            <div className="vera-kicker">
              <span className="vera-kicker-dot" />
              Trusted chronology for records-heavy work
            </div>
            <h1>Turn complex records into verified timelines.</h1>
            <p>
              Upload complex medical or legal records and VeraChron organizes the key events
              into a source-backed chronology.
            </p>
            <div className="vera-actions">
              <a className="vera-btn vera-btn-primary" href="#workflow">
                Start a Timeline
              </a>
              <a className="vera-btn vera-btn-ghost" href="#preview">
                See Workflow
              </a>
            </div>
            <div className="vera-hero-notes">
              <span>
                <i />
                Professional review flow
              </span>
              <span>
                <i />
                Source-page traceability
              </span>
              <span>
                <i />
                Built for legal and medical records
              </span>
            </div>
          </div>

          <div className="vera-visual" aria-label="VeraChron chronology visual">
            <div className="vera-blocks">
              <div className="vera-block">
                <div className="vera-block-head">
                  <span className="vera-pill">Record Packet</span>
                  <span className="vera-mini-meta">Scattered inputs</span>
                </div>
                <div className="vera-line-list">
                  <div className="vera-line-row">
                    <span>PDF intake</span>
                    <span>Medical + legal files</span>
                    <span className="vera-line-page">p. 01</span>
                  </div>
                  <div className="vera-line-row">
                    <span>Scanned pages</span>
                    <span>Mixed source order</span>
                    <span className="vera-line-page">p. 07</span>
                  </div>
                </div>
              </div>

              <div className="vera-connector" />

              <div className="vera-block dark">
                <div className="vera-block-head">
                  <span className="vera-pill dark">Extracted Events</span>
                  <span className="vera-mini-meta">Key dates and notes</span>
                </div>
                <div className="vera-line-list">
                  <div className="vera-line-row">
                    <span>08:10 AM</span>
                    <span>Initial encounter</span>
                    <span className="vera-line-page">p. 12</span>
                  </div>
                  <div className="vera-line-row">
                    <span>11:45 AM</span>
                    <span>Radiology review</span>
                    <span className="vera-line-page">p. 18</span>
                  </div>
                </div>
              </div>

              <div className="vera-connector" />

              <div className="vera-block">
                <div className="vera-block-head">
                  <span className="vera-pill">Verified Timeline</span>
                  <span className="vera-mini-meta">Source-linked output</span>
                </div>
                <div className="vera-line-list">
                  <div className="vera-line-row">
                    <span>May 2</span>
                    <span>Care event confirmed</span>
                    <span className="vera-line-page">p. 12</span>
                  </div>
                  <div className="vera-line-row">
                    <span>May 5</span>
                    <span>Specialist review confirmed</span>
                    <span className="vera-line-page">p. 23</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vera-section vera-problem" id="product">
        <div className="vera-shell">
          <h2>Complex records slow every case down.</h2>
          <p className="vera-section-copy">
            When teams receive a packet with mixed sources and uneven formatting, the work slows
            down before the review even begins.
          </p>
          <div className="vera-problem-grid" style={{ marginTop: 28 }}>
            {problemRows.map((row, index) => (
              <div className="vera-problem-row" key={row.title}>
                <h3>{row.title}</h3>
                <p>{row.copy}</p>
                <span className="vera-problem-tag">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vera-section vera-workflow" id="workflow">
        <div className="vera-shell">
          <h2>Workflow built for review teams.</h2>
          <p className="vera-section-copy">
            VeraChron moves a case through a careful sequence so the final chronology remains easy
            to inspect, defend, and export.
          </p>

          <div className="vera-rail" role="list" aria-label="Workflow sequence">
            {workflowSteps.map((item, index) => (
              <div className="vera-step" key={item.step} role="listitem">
                <div className="vera-step-marker">{index + 1}</div>
                <div className="vera-step-card">
                  <h3>
                    {item.step} - {item.title}
                  </h3>
                  <p>{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vera-section vera-preview" id="preview">
        <div className="vera-shell">
          <h2>Case review preview.</h2>
          <p className="vera-section-copy">
            A product direction that centers date grouping, source pages, and practical export
            flow.
          </p>

          <div className="vera-preview-layout">
            <div className="vera-preview-card">
              <div className="vera-preview-topbar">
                <div className="vera-summary">
                  <strong>Case Summary: Records Packet 24-017</strong>
                  <span>42 source pages, 18 extracted events, 9 verified milestones</span>
                </div>
                <a className="vera-export" href="#final">
                  Export Timeline
                </a>
              </div>

              <div className="vera-preview-body">
                <div className="vera-timeline-pane">
                  <p className="vera-pane-title">Timeline</p>
                  {mockTimeline.map((group) => (
                    <div className="vera-group" key={group.date}>
                      <div className="vera-date">{group.date}</div>
                      {group.items.map((entry) => (
                        <div className="vera-event" key={`${group.date}-${entry.text}`}>
                          <div className="vera-event-top">
                            <strong>{entry.time}</strong>
                            <span>{entry.page}</span>
                          </div>
                          <p>{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="vera-source-pane">
                  <div className="vera-source-head">
                    <div>
                      <strong>Source Document Preview</strong>
                      <div>
                        <span>Page 18 of 42</span>
                      </div>
                    </div>
                    <div className="vera-pill">Verified source</div>
                  </div>

                  <div className="vera-document">
                    <div className="vera-document-body">
                      <div className="vera-doc-bar short" />
                      <div className="vera-doc-bar mid" />
                      <div className="vera-doc-bar" />
                      <div className="vera-doc-block">
                        <div className="vera-doc-row">
                          <span>Radiology impression</span>
                          <span>Source page label</span>
                        </div>
                        <div className="vera-doc-chip">Source page: p. 18</div>
                        <div className="vera-doc-highlight">
                          Findings reference the encounter documented earlier in the packet and link
                          back to the verified event row.
                        </div>
                      </div>
                      <div className="vera-doc-bar mid" />
                      <div className="vera-doc-bar short" />
                      <div className="vera-doc-bar" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vera-section vera-usecases">
        <div className="vera-shell">
          <h2>Built for the teams who need the chronology first.</h2>
          <p className="vera-section-copy">
            Different review groups need the same thing: a clear sequence of events with evidence
            that is easy to trace.
          </p>
          <div className="vera-usecases-grid">
            {useCases.map((item, index) => (
              <article className="vera-usecase" key={item.title}>
                <div className="vera-icon">0{index + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vera-section vera-security" id="security">
        <div className="vera-shell">
          <h2>Security that matches the sensitivity of the work.</h2>
          <p className="vera-section-copy">
            VeraChron is designed for cautious handling of records, with a workflow that keeps
            privacy and traceability in view.
          </p>
          <div className="vera-security-grid">
            {securityItems.map((item) => (
              <div className="vera-security-item" key={item}>
                <div className="vera-security-mark">✓</div>
                <div>
                  <strong>{item}</strong>
                  <span>Structured to support careful handling of confidential case material.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vera-section vera-pricing" id="pricing">
        <div className="vera-shell">
          <h2>Pricing that fits the way review teams operate.</h2>
          <p className="vera-section-copy">
            Flexible packaging for one-off matters, steady case volume, or larger teams that need
            a consistent chronology workflow.
          </p>
          <div className="vera-pricing-grid">
            <div className="vera-pricing-card">
              <div className="vera-pricing-badge">One-off review</div>
              <h3>For a single packet or matter</h3>
              <p>Best for teams that need a focused chronology on an occasional basis.</p>
            </div>
            <div className="vera-pricing-card">
              <div className="vera-pricing-badge">Ongoing cases</div>
              <h3>For repeat review work</h3>
              <p>Designed for groups handling a steady stream of records and timelines.</p>
            </div>
            <div className="vera-pricing-card">
              <div className="vera-pricing-badge">Higher volume</div>
              <h3>For larger operations</h3>
              <p>Structured for teams that want a more coordinated review workflow across matters.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vera-section vera-final" id="final">
        <div className="vera-shell">
          <div className="vera-final-band">
            <div>
              <h2>Build a verified chronology from your next record packet.</h2>
              <p>
                Move from scattered pages to a source-backed timeline that is easier to review,
                share, and trust.
              </p>
            </div>
            <a className="vera-btn vera-btn-primary" href="#workflow">
              Start Timeline
            </a>
          </div>
          <div className="vera-footer-spacer" />
        </div>
      </section>
    </main>
  );
}
