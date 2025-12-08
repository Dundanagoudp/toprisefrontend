import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileSection({ 
  title, 
  description, 
  children, 
  className = "" 
}: ProfileSectionProps) {
  return (
    <Card className={`bg-card border-border/50 ${className}`}>
      <CardHeader className="pb-4 max-sm:px-3 max-sm:pt-4">
        <CardTitle className="text-lg font-semibold text-foreground max-sm:text-base">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 max-sm:text-xs">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="max-sm:px-3 max-sm:pb-4">
        {children}
      </CardContent>
    </Card>
  );
}
