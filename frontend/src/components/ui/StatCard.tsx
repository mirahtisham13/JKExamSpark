import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  change?: { value: string; positive: boolean };
}

export function StatCard({ label, value, icon: Icon, change }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-4 flex items-center text-sm">
          <span className={change.positive ? 'text-success' : 'text-danger'}>
            {change.positive ? '+' : '-'}{change.value}
          </span>
          <span className="text-text-muted ml-2">from last month</span>
        </div>
      )}
    </Card>
  );
}
