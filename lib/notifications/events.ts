/** Notification event catalogue + types. Plain module (importable anywhere). */

export const NOTIFICATION_EVENTS = [
  { key: "sla-breach",      label: "SLA breach risk on service tickets" },
  { key: "project-phase",   label: "Project moved between phases" },
  { key: "low-stock",       label: "Inventory low-stock alerts" },
  { key: "po-approval",     label: "PO approvals required" },
  { key: "invoice-paid",    label: "Invoice paid" },
  { key: "invoice-overdue", label: "Invoice goes overdue" },
  { key: "amc-renewal",     label: "AMC renewal approaching" },
  { key: "daily-digest",    label: "Daily revenue digest" },
] as const;

export type NotificationPref = { email: boolean; inApp: boolean };
export type NotificationPrefs = Record<string, NotificationPref>;

export const DEFAULT_NOTIFICATION_PREF: NotificationPref = { email: true, inApp: true };
