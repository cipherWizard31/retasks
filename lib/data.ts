export type Priority = "high" | "medium" | "low";
export type Category =
  | "spiritual"
  | "health"
  | "study"
  | "work"
  | "cleaning"
  | "finance"
  | "personal"
  | "custom";
export type Status = "completed" | "due" | "overdue" | "upcoming";
export type RepeatType =
  | "daily"
  | "weekly"
  | "monthly"
  | "every_x_days"
  | "every_x_weeks"
  | "every_x_months"
  | "custom";
export type CompletionLogic = "fixed" | "last_completion";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  status: Status;
  repeatType: RepeatType;
  repeatInterval?: number;
  reminderTime?: string;
  startDate: string;
  completionLogic: CompletionLogic;
  completionRate: number;
  streak: number;
  totalCompleted: number;
  totalMissed: number;
}

export interface HistoryEntry {
  date: string;
  completed: boolean;
  skipped?: boolean;
}

export const TASKS: Task[] = [
  {
    id: "1",
    title: "Read Bible",
    description: "Daily scripture reading and devotional time",
    category: "spiritual",
    priority: "high",
    status: "completed",
    repeatType: "daily",
    reminderTime: "8:00 AM",
    startDate: "2025-01-01",
    completionLogic: "fixed",
    completionRate: 92,
    streak: 14,
    totalCompleted: 183,
    totalMissed: 16,
  },
  {
    id: "2",
    title: "Morning Run",
    description: "5km jog around the park",
    category: "health",
    priority: "high",
    status: "due",
    repeatType: "daily",
    reminderTime: "6:30 AM",
    startDate: "2025-02-01",
    completionLogic: "fixed",
    completionRate: 78,
    streak: 5,
    totalCompleted: 120,
    totalMissed: 34,
  },
  {
    id: "3",
    title: "Review Flashcards",
    description: "Anki review session – 20 minutes",
    category: "study",
    priority: "medium",
    status: "upcoming",
    repeatType: "daily",
    reminderTime: "7:00 PM",
    startDate: "2025-03-01",
    completionLogic: "fixed",
    completionRate: 85,
    streak: 9,
    totalCompleted: 98,
    totalMissed: 17,
  },
  {
    id: "4",
    title: "Water Plants",
    description: "Water all indoor and balcony plants",
    category: "cleaning",
    priority: "low",
    status: "overdue",
    repeatType: "every_x_days",
    repeatInterval: 3,
    reminderTime: "8:00 PM",
    startDate: "2025-01-15",
    completionLogic: "last_completion",
    completionRate: 65,
    streak: 0,
    totalCompleted: 55,
    totalMissed: 30,
  },
  {
    id: "5",
    title: "Weekly Budget Review",
    description: "Review spending and update budget spreadsheet",
    category: "finance",
    priority: "high",
    status: "upcoming",
    repeatType: "weekly",
    reminderTime: "10:00 AM",
    startDate: "2025-01-05",
    completionLogic: "fixed",
    completionRate: 88,
    streak: 7,
    totalCompleted: 28,
    totalMissed: 4,
  },
  {
    id: "6",
    title: "Deep Work Block",
    description: "Focused coding or writing session – 2 hours",
    category: "work",
    priority: "high",
    status: "due",
    repeatType: "daily",
    reminderTime: "9:00 AM",
    startDate: "2025-02-15",
    completionLogic: "fixed",
    completionRate: 80,
    streak: 3,
    totalCompleted: 109,
    totalMissed: 27,
  },
  {
    id: "7",
    title: "Journaling",
    description: "Reflect on the day and write gratitude notes",
    category: "personal",
    priority: "medium",
    status: "upcoming",
    repeatType: "daily",
    reminderTime: "9:30 PM",
    startDate: "2025-01-10",
    completionLogic: "fixed",
    completionRate: 71,
    streak: 2,
    totalCompleted: 145,
    totalMissed: 59,
  },
  {
    id: "8",
    title: "Clean Kitchen",
    description: "Deep clean counters, sink, and stovetop",
    category: "cleaning",
    priority: "medium",
    status: "upcoming",
    repeatType: "every_x_days",
    repeatInterval: 7,
    reminderTime: "11:00 AM",
    startDate: "2025-01-01",
    completionLogic: "last_completion",
    completionRate: 90,
    streak: 4,
    totalCompleted: 26,
    totalMissed: 3,
  },
  {
    id: "9",
    title: "Gym Workout",
    description: "Strength training – push/pull/legs split",
    category: "health",
    priority: "high",
    status: "completed",
    repeatType: "every_x_days",
    repeatInterval: 2,
    reminderTime: "6:00 AM",
    startDate: "2025-02-01",
    completionLogic: "last_completion",
    completionRate: 82,
    streak: 6,
    totalCompleted: 88,
    totalMissed: 19,
  },
  {
    id: "10",
    title: "Read 30 Pages",
    description: "Reading goal – any book from current list",
    category: "personal",
    priority: "medium",
    status: "completed",
    repeatType: "daily",
    reminderTime: "8:00 PM",
    startDate: "2025-01-01",
    completionLogic: "fixed",
    completionRate: 68,
    streak: 1,
    totalCompleted: 139,
    totalMissed: 65,
  },
];

export const HISTORY_ENTRIES: HistoryEntry[] = [
  { date: "Jul 1", completed: true },
  { date: "Jul 2", completed: true },
  { date: "Jul 3", completed: false },
  { date: "Jul 4", completed: true },
  { date: "Jul 5", completed: true },
  { date: "Jul 6", completed: true },
  { date: "Jul 7", completed: true },
  { date: "Jul 8", completed: false },
  { date: "Jul 9", completed: true },
  { date: "Jul 10", completed: false, skipped: true },
  { date: "Jul 11", completed: true },
  { date: "Jul 12", completed: true },
  { date: "Jul 13", completed: true },
];

export const CATEGORY_META: Record<
  Category,
  { label: string; icon: string; color: string; cssClass: string }
> = {
  spiritual: { label: "Spiritual", icon: "✝️", color: "#7c3aed", cssClass: "cat-spiritual" },
  health: { label: "Health", icon: "❤️", color: "#dc2626", cssClass: "cat-health" },
  study: { label: "Study", icon: "📚", color: "#2563eb", cssClass: "cat-study" },
  work: { label: "Work", icon: "💼", color: "#16a34a", cssClass: "cat-work" },
  cleaning: { label: "Cleaning", icon: "🧹", color: "#0891b2", cssClass: "cat-cleaning" },
  finance: { label: "Finance", icon: "💰", color: "#d97706", cssClass: "cat-finance" },
  personal: { label: "Personal", icon: "🌟", color: "#a21caf", cssClass: "cat-personal" },
  custom: { label: "Custom", icon: "⚙️", color: "#6b7280", cssClass: "cat-custom" },
};

export const WEEKLY_DATA = [
  { day: "Mon", completed: 6, total: 8 },
  { day: "Tue", completed: 7, total: 8 },
  { day: "Wed", completed: 5, total: 8 },
  { day: "Thu", completed: 8, total: 8 },
  { day: "Fri", completed: 6, total: 8 },
  { day: "Sat", completed: 4, total: 7 },
  { day: "Sun", completed: 7, total: 7 },
];

export const MONTHLY_DATA = [
  { label: "Week 1", rate: 82 },
  { label: "Week 2", rate: 88 },
  { label: "Week 3", rate: 74 },
  { label: "Week 4", rate: 91 },
];
