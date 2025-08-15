import React, { forwardRef } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils';
import type { BaseComponentProps } from '@/types';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseComponentProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  showPasswordToggle = false,
  className,
  type = 'text',
  disabled,
  required,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [internalType, setInternalType] = React.useState(type);
  
  React.useEffect(() => {
    if (type === 'password' && showPasswordToggle) {
      setInternalType(showPassword ? 'text' : 'password');
    }
  }, [type, showPassword, showPasswordToggle]);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = "w-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    default: "bg-white border-gray-300",
    filled: "bg-gray-50 border-gray-200"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-3 py-2 text-sm rounded-lg",
    lg: "px-4 py-3 text-base rounded-lg"
  };
  
  const errorClasses = error 
    ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
    : "";
    
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const paddingWithIcons = cn({
    'pl-10': leftIcon && (size === 'md' || size === 'lg'),
    'pl-9': leftIcon && size === 'sm',
    'pr-10': (rightIcon || (showPasswordToggle && type === 'password') || error) && (size === 'md' || size === 'lg'),
    'pr-9': (rightIcon || (showPasswordToggle && type === 'password') || error) && size === 'sm',
  });

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none",
            iconSize[size]
          )}>
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={internalType}
          disabled={disabled}
          required={required}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            errorClasses,
            paddingWithIcons,
            className
          )}
          {...props}
        />
        
        {/* Error icon */}
        {error && (
          <div className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500",
            iconSize[size],
            {
              'right-10': (rightIcon || (showPasswordToggle && type === 'password')) && (size === 'md' || size === 'lg'),
              'right-9': (rightIcon || (showPasswordToggle && type === 'password')) && size === 'sm',
            }
          )}>
            <AlertCircle className={iconSize[size]} />
          </div>
        )}
        
        {/* Password toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none",
              iconSize[size],
              {
                'right-10': error && (size === 'md' || size === 'lg'),
                'right-9': error && size === 'sm',
              }
            )}
          >
            {showPassword ? (
              <EyeOff className={iconSize[size]} />
            ) : (
              <Eye className={iconSize[size]} />
            )}
          </button>
        )}
        
        {/* Right icon */}
        {rightIcon && !error && !(showPasswordToggle && type === 'password') && (
          <div className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none",
            iconSize[size]
          )}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {/* Helper text or error message */}
      {(error || helperText) && (
        <div className="mt-1 text-sm">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            <span className="text-gray-500">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };