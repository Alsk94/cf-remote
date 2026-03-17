import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  subtitle?: string;
  status?: 'healthy' | 'down' | 'degraded' | 'active' | 'inactive';
  icon?: LucideIcon;
  children?: React.ReactNode;
  onClick?: () => void;
}

const statusColors = {
  healthy: 'bg-success/10 text-success border-success/20',
  active: 'bg-success/10 text-success border-success/20',
  down: 'bg-destructive/10 text-destructive border-destructive/20',
  inactive: 'bg-muted/10 text-muted-foreground border-muted/20',
  degraded: 'bg-warning/10 text-warning border-warning/20',
};

export default function StatusCard({
  title,
  subtitle,
  status,
  icon: Icon,
  children,
  onClick,
}: StatusCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border border-border rounded-lg p-4 transition-all',
        onClick && 'cursor-pointer active:scale-[0.98] hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className="w-5 h-5 text-primary flex-shrink-0" />}
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {status && (
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0',
              statusColors[status]
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
