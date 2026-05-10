import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#5A5A40] text-white hover:bg-[#4A4A35] active:scale-[0.98]',
    secondary: 'bg-[#F5F5F0] text-[#1A1A1A] hover:bg-[#E6E6E1] active:scale-[0.98]',
    outline: 'border border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 active:scale-[0.98]',
    ghost: 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm font-medium',
    lg: 'px-8 py-3.5 text-base font-semibold',
    icon: 'p-2.5',
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, id, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 ml-4">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full bg-white border border-[#1A1A1A]/10 rounded-full px-6 py-2.5 text-sm ring-offset-white transition-all focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40]",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] text-red-500 ml-4">{error}</p>}
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 shadow-sm", className)}>
    {children}
  </div>
);
