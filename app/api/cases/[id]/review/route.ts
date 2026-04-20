import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    case: {
      id: "demo-case-1",
      title: "Laura Knee Injury Case",
      subjectName: "Laura",
      status: "Ready",
    },
    events: [
      {
        id: "evt_1",
        eventDate: "2016-10-08",
        title: "Arthroscopic surgery scheduled",
        description:
          "Patient was scheduled for arthroscopic surgery for partial meniscectomy and ACL reconstruction following a fall that resulted in knee injuries.",
        eventType: "treatment",
        provider: "Writing, Shamika",
        facility: "Riverside Community Hospital",
        documentType: "MEDICAL_RECORD",
        documentName: "riverside-ortho-consult.pdf",
        pageNumber: 2,
        confidence: 0.96,
        isHidden: false,
      },
      {
        id: "evt_2",
        eventDate: "2016-10-11",
        title: "Diagnostic and therapeutic arthroscopy planned",
        description:
          "Plan included diagnostic and therapeutic arthroscopy, possible arthrocentesis, and follow-up rehabilitation planning.",
        eventType: "appointment",
        provider: "Writing, Shamika",
        facility: "Riverside Community Hospital",
        documentType: "MEDICAL_RECORD",
        documentName: "riverside-followup-note.pdf",
        pageNumber: 3,
        confidence: 0.94,
        isHidden: false,
      },
      {
        id: "evt_3",
        eventDate: "2016-10-15",
        title: "MRI reviewed showing meniscal injury",
        description:
          "Imaging review noted meniscal injury and concern for ACL involvement.",
        eventType: "imaging",
        provider: "Writing, Shamika",
        facility: "Riverside Community Hospital",
        documentType: "IMAGING",
        documentName: "mri-knee-report.pdf",
        pageNumber: 1,
        confidence: 0.92,
        isHidden: false,
      },
    ],
    documents: [
      {
        id: "doc_1",
        fileName: "riverside-ortho-consult.pdf",
        documentType: "MEDICAL_RECORD",
        provider: "Writing, Shamika",
        facility: "Riverside Community Hospital",
        pageCount: 8,
        status: "PROCESSED",
        extractedEventsCount: 1,
      },
      {
        id: "doc_2",
        fileName: "riverside-followup-note.pdf",
        documentType: "MEDICAL_RECORD",
        provider: "Writing, Shamika",
        facility: "Riverside Community Hospital",
        pageCount: 6,
        status: "PROCESSED",
        extractedEventsCount: 1,
      },
      {
        id: "doc_3",
        fileName: "mri-knee-report.pdf",
        documentType: "IMAGING",
        provider: "Writing, Shamika",
        facility: "Riverside Community Hospital",
        pageCount: 2,
        status: "PROCESSED",
        extractedEventsCount: 1,
      },
    ],
  });
}