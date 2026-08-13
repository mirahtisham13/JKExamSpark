import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = "MMM dd, yyyy") {
  if (!date) return "";
  return format(new Date(date), formatStr);
}

export function formatScore(score: number, total: number) {
  const percentage = ((score / total) * 100).toFixed(1);
  return `${score}/${total} (${percentage}%)`;
}

export function maskUsername(username: string) {
  if (username.length <= 4) return username;
  return `${username.slice(0, 3)}***${username.slice(-1)}`;
}

export function getVerificationBadgeColor(status: string) {
  switch (status) {
    case 'VERIFIED': return 'bg-success/10 text-success';
    case 'REJECTED': return 'bg-danger/10 text-danger';
    default: return 'bg-accent/10 text-accent';
  }
}

export function formatRank(rank: number) {
  const j = rank % 10,
        k = rank % 100;
  if (j == 1 && k != 11) return rank + "st";
  if (j == 2 && k != 12) return rank + "nd";
  if (j == 3 && k != 13) return rank + "rd";
  return rank + "th";
}
