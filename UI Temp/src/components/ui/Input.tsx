import React, { forwardRef } from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label &&
        <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        }
        <div className="relative">
          {leftIcon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          }
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              transition-shadow disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'}
              ${leftIcon ? 'pl-10' : ''}
              ${className}
            `}
            {...props} />
          
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {helperText && !error &&
        <p className="text-sm text-slate-500">{helperText}</p>
        }
      </div>);

  }
);
Input.displayName = 'Input';