import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with conflict resolution
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as currency
 */
export function formatCurrency(amount) {
  const absAmount = Math.abs(amount);
  const currencySymbol = localStorage.getItem('currency') || '₹';
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return amount < 0 ? `-${currencySymbol}${formatted}` : `${currencySymbol}${formatted}`;
}

/**
 * Format date for display
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Get budget status info
 */
export function getBudgetStatus(percentage) {
  if (percentage > 100) return { label: 'Overspent', color: 'var(--color-danger)', bgColor: 'var(--color-danger-bg)', emoji: '🚨' };
  if (percentage >= 100) return { label: 'Budget Reached', color: 'var(--color-danger)', bgColor: 'var(--color-danger-bg)', emoji: '🔴' };
  if (percentage >= 90) return { label: 'Almost Exceeded', color: 'var(--color-orange)', bgColor: 'var(--color-orange-bg)', emoji: '⚠️' };
  if (percentage >= 70) return { label: 'Getting Close', color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)', emoji: '⚡' };
  return { label: 'Healthy', color: 'var(--color-success)', bgColor: 'var(--color-success-bg)', emoji: '✅' };
}

/**
 * Get progress bar color class based on percentage
 */
export function getProgressColor(percentage) {
  if (percentage > 100) return 'bg-red-500';
  if (percentage >= 90) return 'bg-orange-500';
  if (percentage >= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
}

/**
 * Generate greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
