import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof LucideIcons;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className, ...props }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon size={size} className={className} {...props} />;
};