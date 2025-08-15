import React from 'react';
import { cn } from '@/utils';
import type { BaseComponentProps } from '@/types';

export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  onRemove?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  rounded = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  onRemove,
  className,
  ...props
}) => {
  const baseClasses = "inline-flex items-center font-medium transition-colors";
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    success: "bg-green-100 text-green-800 hover:bg-green-200",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    error: "bg-red-100 text-red-800 hover:bg-red-200",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
  };
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };
  
  const roundedClasses = rounded ? "rounded-full" : "rounded";
  
  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4'
  };

  const isClickable = onClick || onRemove;

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        roundedClasses,
        isClickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {leftIcon && (
        <span className={cn("mr-1", iconSize[size])}>
          {leftIcon}
        </span>
      )}
      
      {children}
      
      {rightIcon && (
        <span className={cn("ml-1", iconSize[size])}>
          {rightIcon}
        </span>
      )}
      
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "ml-1 rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500",
            iconSize[size]
          )}
        >
          <svg
            className={iconSize[size]}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

Badge.displayName = 'Badge';

export { Badge };