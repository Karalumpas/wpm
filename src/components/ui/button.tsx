import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md border bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

