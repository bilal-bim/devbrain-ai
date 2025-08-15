import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/utils';
import type { BaseComponentProps } from '@/types';

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  showStatus = false,
  onClick,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl',
    '2xl': 'w-16 h-16 text-2xl'
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-4 h-4'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
    '2xl': 'w-8 h-8'
  };

  const shouldShowImage = src && !imageError && imageLoaded;
  const shouldShowFallback = fallback && (!src || imageError || !imageLoaded);

  React.useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [src]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden select-none",
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Image */}
      {src && (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className={cn(
            "w-full h-full object-cover",
            shouldShowImage ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Fallback with initials */}
      {shouldShowFallback && (
        <span className="font-medium text-gray-700">
          {getInitials(fallback)}
        </span>
      )}

      {/* Default user icon */}
      {!shouldShowImage && !shouldShowFallback && (
        <User className={cn("text-gray-400", iconSizes[size])} />
      )}

      {/* Status indicator */}
      {showStatus && status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            statusSizes[size],
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

export { Avatar };