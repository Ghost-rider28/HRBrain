import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export default function StatsCard({ title, value, icon: Icon, iconColor, iconBgColor }: StatsCardProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${iconBgColor} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">{title}</dt>
              <dd className="text-lg font-semibold text-foreground" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
