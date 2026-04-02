export const CREDITOR_STAGES = [
  "Identified",
  "Notified",
  "InNegotiation",
  "OfferMade",
  "Agreed",
  "Voted",
] as const;

export const CREDITOR_STAGE_LABELS: Record<string, string> = {
  Identified: "Identified",
  Notified: "Notified",
  InNegotiation: "In Negotiation",
  OfferMade: "Offer Made",
  Agreed: "Agreed",
  Voted: "Voted",
};

export const SECURITY_TYPE_LABELS: Record<string, string> = {
  Secured: "Secured",
  Preferent: "Preferent",
  Concurrent: "Concurrent",
};

export const TASK_PRIORITY_ORDER: Record<string, number> = {
  Critical: 0,
  High: 1,
  Normal: 2,
};

export const COMMUNICATION_METHODS = ["Email", "Phone", "Meeting", "Letter"] as const;

export const DEFAULT_ORG_ID = "org_mpumalanga_steel";
