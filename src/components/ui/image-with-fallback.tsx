import React, { useState } from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

export function ImageWithFallback({ src, alt, className, fallback, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-gray-100 text-gray-300", className)}>
        {fallback || <PackageOpen className="w-10 h-10" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
