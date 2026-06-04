import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
          )}
          <input
            ref={ref}
            id={id}
            className={clsx(
              'w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
              error ? 'border-red-400 focus:ring-red-500' : 'border-slate-200',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
