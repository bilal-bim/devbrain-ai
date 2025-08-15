import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import type { BaseComponentProps } from '@/types';

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  'data-testid'?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  type = 'button',
  form,
  'data-testid': testId,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";
  
  const variantClasses = {
    primary: "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm focus:ring-primary-500",
    secondary: "bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 border border-gray-300 shadow-sm focus:ring-primary-500",
    ghost: "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-primary-500",
    danger: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm focus:ring-red-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg"
  };
  
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(event);
  };

  return (
    <button
      type={type}
      form={form}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
          'opacity-50 cursor-not-allowed': disabled || loading,
          'cursor-wait': loading
        },
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={testId}
      {...props}
    >
      {loading && (
        <Loader2 className={cn("animate-spin", iconSize[size], {
          "mr-2": children || rightIcon,
          "mr-1": size === 'sm' && (children || rightIcon)
        })} />
      )}
      
      {!loading && leftIcon && (
        <span className={cn(iconSize[size], {
          "mr-2": children || rightIcon,
          "mr-1": size === 'sm' && (children || rightIcon)
        })}>
          {leftIcon}
        </span>
      )}
      
      {children}
      
      {!loading && rightIcon && (
        <span className={cn(iconSize[size], {
          "ml-2": children || leftIcon,
          "ml-1": size === 'sm' && (children || leftIcon)
        })}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

Button.displayName = 'Button';

export { Button };