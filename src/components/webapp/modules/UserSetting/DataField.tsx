import React from 'react';

interface DataFieldProps {
  label: string;
  value: string;
  className?: string;
}

export function DataField({ 
  label, 
  value, 
  className = "" 
}: DataFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-sm font-medium text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-foreground">
        {value}
      </p>
    </div>
  );
}
