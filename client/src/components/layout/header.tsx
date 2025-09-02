import { Button } from "@/components/ui/button";
import { Menu, RefreshCw } from "lucide-react";

interface HeaderProps {
  title: string;
  aiEnabled?: boolean;
}

export default function Header({ title, aiEnabled = true }: HeaderProps) {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
      <div className="flex-1 px-4 flex justify-between sm:px-6 lg:px-8">
        <div className="flex-1 flex items-center">
          <Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-4 ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-foreground" data-testid="page-title">{title}</h1>
            {aiEnabled && (
              <span className="px-2 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-md">
                AI Enabled
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" data-testid="refresh-button">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
