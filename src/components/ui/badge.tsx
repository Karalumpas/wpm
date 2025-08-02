import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'outline' | 'destructive'; }) {
  const base = 'inline-block px-3 py-1 rounded-full text-xs font-medium';
  const variants: Record<string, string> = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600',
    outline: 'border border-gray-300 text-gray-800',
    destructive: 'bg-red-100 text-red-700',
  };
  return <span className={cn(base, variants[variant], className)} {...props} />;
}
