import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCheck, 
  Users, 
  MessageCircle, 
  Settings,
  Shield
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Hiring & Recruitment",
    href: "/hiring",
    icon: Briefcase,
  },
  {
    name: "Candidate Evaluation",
    href: "/evaluation",
    icon: UserCheck,
  },
  {
    name: "Onboarding",
    href: "/onboarding",
    icon: Users,
  },
  {
    name: "Employee Support",
    href: "/support",
    icon: MessageCircle,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-1 min-h-0 bg-card border-r border-border">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">HR Intelligence</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Platform</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-5 flex-1 px-6 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
            
            <div className="border-t border-border mt-6 pt-6">
              <Link href="/settings">
                <a className="text-muted-foreground hover:bg-muted hover:text-foreground group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors">
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </a>
              </Link>
            </div>
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">SC</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Sarah Chen</p>
              <p className="text-xs text-muted-foreground">HR Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
