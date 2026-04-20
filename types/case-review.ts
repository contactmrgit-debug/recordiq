export type DisplayMode = "TIMELINE" | "OUTLINE" | "DOCUMENTS";

export type TimelineEventItem = {
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

export type DocumentItem = {
  id: string;
  fileName: string;
  documentType?: string | null;
  provider?: string | null;
  facility?: string | null;
  pageCount?: number | null;
  status?: string | null;
  createdAt?: string | null;
  extractedEventsCount?: number | null;
};

export type Filters = {
  search: string;
  documentTypes: string[];
  providers: string[];
  facilities: string[];
  eventTypes: string[];
  showOnlyKeyEvents: boolean;
  hideLowConfidence: boolean;
};