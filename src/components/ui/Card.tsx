import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', children, ...props }, ref) => {
    const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
    return (
      <div
        ref={ref}
        className={clsx('bg-white rounded-2xl shadow-sm border border-slate-100', paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
