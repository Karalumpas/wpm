import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Custom Toast Notifications
export const toast = {
  success: (message: string) => {
    if (typeof document === 'undefined') return;
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      toastEl.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom');
      setTimeout(() => document.body.removeChild(toastEl), 500);
    }, 3000);
  },
  error: (message: string) => {
    if (typeof document === 'undefined') return;
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      toastEl.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom');
      setTimeout(() => document.body.removeChild(toastEl), 500);
    }, 3000);
  }
};