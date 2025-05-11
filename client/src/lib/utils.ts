import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern: string = "PPP"): string {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, pattern);
}

export function formatTimeAgo(date: Date | string): string {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatPercentage(value: number, decimals: number = 1): string {
  if (value === undefined || value === null) return "N/A";
  return `${value.toFixed(decimals)}%`;
}

export function getInitials(name: string): string {
  if (!name) return "?";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export const colorMap = {
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  indigo: "bg-indigo-100 text-indigo-800",
  purple: "bg-purple-100 text-purple-800",
  gray: "bg-neutral-100 text-neutral-800",
};

export const roleColorMap: Record<string, string> = {
  admin: colorMap.red,
  chief_of_staff: colorMap.indigo,
  team_leader: colorMap.purple,
  guard: colorMap.blue,
};

export const statusColorMap: Record<string, string> = {
  active: colorMap.green,
  inactive: colorMap.gray,
  pending: colorMap.amber,
  "on-duty": colorMap.green,
  "late-check-in": colorMap.amber,
  "incident-reported": colorMap.red,
  scheduled: colorMap.blue,
  completed: colorMap.green,
  missed: colorMap.red,
  "on-time": colorMap.green,
  late: colorMap.amber,
  absent: colorMap.red,
  open: colorMap.amber,
  investigating: colorMap.blue,
  resolved: colorMap.green,
  closed: colorMap.gray,
  low: colorMap.blue,
  medium: colorMap.amber,
  high: colorMap.red,
  critical: colorMap.red,
};

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  } else if (cleaned.length === 11) {
    return `+${cleaned.charAt(0)} (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }
  
  // Return original if can't format
  return phone;
}

export function generateGuardId(): string {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(Math.random() * 900) + 100;
  return `G-${year}-${randomNumber}`;
}

export function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helpful URL validator
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
