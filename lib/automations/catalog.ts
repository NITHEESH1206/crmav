/**
 * Static catalogue of triggers, conditions, actions, and pre-built templates.
 * The visual builder + template gallery reads from this. When the backend job
 * runner ships, persistence and execution map onto these IDs.
 */

import {
  Clock,
  AlertTriangle,
  Boxes,
  ShoppingCart,
  Receipt,
  Shield,
  FolderKanban,
  Bell,
  Mail,
  MessageSquare,
  Slack,
  Webhook,
  Plus,
  Edit3,
  Sparkles,
  CheckCircle2,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

export type TriggerId =
  | "ticket.created"
  | "ticket.status-changed"
  | "sla.warning"
  | "inventory.low-stock"
  | "po.delayed"
  | "po.threshold"
  | "invoice.overdue"
  | "amc.expiring"
  | "project.phase-changed"
  | "project.risk-changed"
  | "schedule.daily"
  | "schedule.weekly";

export type Trigger = {
  id: TriggerId;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "Lifecycle" | "Threshold" | "Time" | "Event";
};

export const TRIGGERS: Trigger[] = [
  { id: "ticket.created",        label: "Service ticket created",     description: "Fires on every new ticket.",                        icon: AlertTriangle,   category: "Lifecycle" },
  { id: "ticket.status-changed", label: "Ticket status changes",      description: "Fires when status transitions (e.g. to Resolved).", icon: AlertTriangle,   category: "Lifecycle" },
  { id: "sla.warning",           label: "SLA timer crosses threshold",description: "Fire at 50% / 80% / breach of an SLA window.",      icon: Clock,           category: "Threshold" },
  { id: "inventory.low-stock",   label: "Inventory below reorder",    description: "Stock falls to or below the reorder level.",        icon: Boxes,           category: "Threshold" },
  { id: "po.delayed",            label: "PO past expected date",      description: "PO not received past its expected delivery.",       icon: ShoppingCart,    category: "Threshold" },
  { id: "po.threshold",          label: "PO value above threshold",   description: "PO created with value above $X.",                   icon: ShoppingCart,    category: "Event" },
  { id: "invoice.overdue",       label: "Invoice goes overdue",       description: "Invoice age crosses 7 / 14 / 30 / 45 days.",        icon: Receipt,         category: "Threshold" },
  { id: "amc.expiring",          label: "AMC expiring soon",          description: "AMC end date within 30 / 60 / 90 days.",            icon: Shield,          category: "Lifecycle" },
  { id: "project.phase-changed", label: "Project phase changes",      description: "Fires on every phase transition.",                  icon: FolderKanban,    category: "Lifecycle" },
  { id: "project.risk-changed",  label: "Project risk level changes", description: "Especially when escalating Med→High.",              icon: AlertTriangle,   category: "Lifecycle" },
  { id: "schedule.daily",        label: "Daily at time",              description: "Cron-style daily trigger.",                         icon: Clock,           category: "Time" },
  { id: "schedule.weekly",       label: "Weekly on day",              description: "Cron-style weekly trigger.",                        icon: Clock,           category: "Time" },
];

export type ActionId =
  | "notify.in-app"
  | "notify.email"
  | "notify.slack"
  | "notify.teams"
  | "webhook.post"
  | "create.task"
  | "create.ticket"
  | "create.po"
  | "create.invoice"
  | "update.field"
  | "ai.generate"
  | "approval.request"
  | "wait.hours"
  | "wait.days";

export type Action = {
  id: ActionId;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "Notify" | "Create" | "Update" | "AI" | "Control";
};

export const ACTIONS: Action[] = [
  { id: "notify.in-app",     label: "Notify in-app",          description: "Adds an entry to the recipient's bell menu.",         icon: Bell,            category: "Notify" },
  { id: "notify.email",      label: "Send email",             description: "Branded email template with placeholders.",           icon: Mail,            category: "Notify" },
  { id: "notify.slack",      label: "Post to Slack channel",  description: "Requires Slack integration.",                          icon: Slack,           category: "Notify" },
  { id: "notify.teams",      label: "Post to Teams channel",  description: "Requires Microsoft Teams integration.",                icon: MessageSquare,   category: "Notify" },
  { id: "webhook.post",      label: "Call webhook",           description: "POST a JSON payload to a URL.",                        icon: Webhook,         category: "Notify" },
  { id: "create.task",       label: "Create a task",          description: "Add a To-do with optional assignee + due date.",       icon: ListChecks,      category: "Create" },
  { id: "create.ticket",     label: "Create a service ticket",description: "Open a P3 ticket with a templated title.",             icon: AlertTriangle,   category: "Create" },
  { id: "create.po",         label: "Create draft PO",        description: "Stub a draft PO for the reorder SKU + vendor.",        icon: ShoppingCart,    category: "Create" },
  { id: "create.invoice",    label: "Create draft invoice",   description: "Recurring or milestone invoice draft.",                icon: Receipt,         category: "Create" },
  { id: "update.field",      label: "Update a field",         description: "Set a field on the triggering record.",                icon: Edit3,           category: "Update" },
  { id: "ai.generate",       label: "Run AI generation",      description: "Call any Generate kind and attach the result.",        icon: Sparkles,        category: "AI" },
  { id: "approval.request",  label: "Request approval",       description: "Send to an approver chain and pause until done.",      icon: CheckCircle2,    category: "Control" },
  { id: "wait.hours",        label: "Wait N hours",           description: "Pause execution before continuing.",                   icon: Clock,           category: "Control" },
  { id: "wait.days",         label: "Wait N days",            description: "Pause execution before continuing.",                   icon: Clock,           category: "Control" },
];

export type AutomationTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: TriggerId;
  conditions: { field: string; op: string; value: string }[];
  actions: { id: ActionId; params?: Record<string, string> }[];
};

export const TEMPLATES: AutomationTemplate[] = [
  {
    id: "sla-watchdog",
    name: "SLA Watchdog",
    description: "Alert on-call at 50% / 80% / breach for every open P1 or P2 ticket.",
    category: "Service",
    trigger: "sla.warning",
    conditions: [
      { field: "priority", op: "is", value: "P1 or P2" },
      { field: "status", op: "is", value: "OPEN or IN_PROGRESS" },
    ],
    actions: [
      { id: "notify.slack",   params: { channel: "#oncall" } },
      { id: "notify.in-app",  params: { recipient: "assignee" } },
    ],
  },
  {
    id: "low-stock-reorder",
    name: "Low-Stock Reorder",
    description: "Auto-create a draft PO when SKU stock falls to the reorder level.",
    category: "Inventory",
    trigger: "inventory.low-stock",
    conditions: [],
    actions: [
      { id: "create.po", params: { quantity: "3× reorder level", vendor: "preferred" } },
      { id: "notify.in-app", params: { recipient: "procurement" } },
    ],
  },
  {
    id: "amc-renewal-pipeline",
    name: "AMC Renewal Pipeline",
    description: "90 days before AMC expiry, spin up a renewal opportunity for the account owner.",
    category: "Service",
    trigger: "amc.expiring",
    conditions: [{ field: "days_until_expiry", op: "≤", value: "90" }],
    actions: [
      { id: "create.task",   params: { assignee: "account owner", due: "in 7 days" } },
      { id: "notify.email",  params: { template: "AMC renewal heads-up" } },
    ],
  },
  {
    id: "commissioning-gate",
    name: "Commissioning Quality Gate",
    description: "Block phase-promote to Handover unless commissioning checklist is 100%.",
    category: "Projects",
    trigger: "project.phase-changed",
    conditions: [
      { field: "new_phase", op: "is", value: "HANDOVER" },
      { field: "checklist_complete", op: "<", value: "100" },
    ],
    actions: [
      { id: "update.field",  params: { field: "phase", revert: "true" } },
      { id: "notify.in-app", params: { recipient: "PM" } },
    ],
  },
  {
    id: "invoice-aging",
    name: "Invoice Aging Cascade",
    description: "At 7, 14, 30, 45 days overdue: email, slack, escalate.",
    category: "Finance",
    trigger: "invoice.overdue",
    conditions: [],
    actions: [
      { id: "notify.email",   params: { template: "Friendly reminder" } },
      { id: "wait.days",      params: { days: "7" } },
      { id: "notify.slack",   params: { channel: "#finance" } },
    ],
  },
  {
    id: "procurement-approval",
    name: "Procurement Approval",
    description: "POs above $10k require Finance Lead sign-off before issuing to vendor.",
    category: "Procurement",
    trigger: "po.threshold",
    conditions: [{ field: "total", op: ">", value: "$10,000" }],
    actions: [
      { id: "approval.request", params: { approvers: "Finance Lead" } },
      { id: "notify.in-app",    params: { recipient: "creator" } },
    ],
  },
  {
    id: "risk-escalation",
    name: "Risk Escalation",
    description: "Project risk rising 2 levels within 7 days alerts the GM.",
    category: "Projects",
    trigger: "project.risk-changed",
    conditions: [{ field: "risk_delta_7d", op: "≥", value: "2" }],
    actions: [
      { id: "notify.email",  params: { recipient: "GM" } },
      { id: "ai.generate",   params: { kind: "project-risk-brief" } },
    ],
  },
  {
    id: "daily-operations-brief",
    name: "Daily Operations Brief",
    description: "08:30 weekday — email all PMs the day's at-risk items.",
    category: "Insights",
    trigger: "schedule.daily",
    conditions: [{ field: "time", op: "=", value: "08:30 weekdays" }],
    actions: [
      { id: "ai.generate",  params: { kind: "ops-brief" } },
      { id: "notify.email", params: { recipient: "all PMs" } },
    ],
  },
];
