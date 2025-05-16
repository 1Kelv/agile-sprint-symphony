
import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className,
  iconClassName,
}) => {
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card dark:border-muted p-6 shadow-subtle transition-all duration-500 hover:shadow-elevated",
        className
      )}
    >
      <div className="flex flex-col space-y-4">
        <div 
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary transition-all duration-300 group-hover:scale-110",
            iconClassName
          )}
        >
          {icon}
        </div>
        
        <h3 className="text-xl font-medium tracking-tight group-hover:text-primary transition-colors duration-300">{title}</h3>
        
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-agile-primary to-agile-secondary transition-all duration-500 group-hover:w-full"></div>
    </div>
  );
};

export default FeatureCard;
