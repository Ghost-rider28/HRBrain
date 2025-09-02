import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";
import { 
  UserPlus, 
  CheckCircle, 
  Clock, 
  Calendar,
  Mail,
  Settings,
  Users,
  AlertCircle,
  Play
} from "lucide-react";

export default function Onboarding() {
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false);

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/onboarding/employees'],
    queryFn: api.getEmployees,
  }) as { data: any[], isLoading: boolean };

  const { data: onboardingTasks = [] } = useQuery({
    queryKey: ['/api/onboarding/tasks'],
    queryFn: () => api.getOnboardingTasks(),
  }) as { data: any[] };

  const getTasksForEmployee = (employeeId: number) => {
    return onboardingTasks.filter(task => task.employeeId === employeeId);
  };

  const getCompletionProgress = (employeeId: number) => {
    const tasks = getTasksForEmployee(employeeId);
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed');
    return Math.round((completedTasks.length / tasks.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'onboarding': return 'bg-primary text-primary-foreground';
      case 'active': return 'bg-accent text-accent-foreground';
      case 'completed': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-primary" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const activeOnboarding = employees.filter(emp => emp.status === 'onboarding');
  const completedOnboarding = employees.filter(emp => emp.status === 'active');
  const totalTasks = onboardingTasks.length;
  const completedTasks = onboardingTasks.filter(task => task.status === 'completed').length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-64">
        <Header title="Onboarding Support" />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Active Onboarding</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-active-onboarding">
                            {activeOnboarding.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-accent" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Completed</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-completed-onboarding">
                            {completedOnboarding.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-secondary" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Tasks Completed</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-tasks-completed">
                            {completedTasks}/{totalTasks}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Avg. Duration</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-avg-duration">
                            5 days
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  onClick={() => setShowOnboardingFlow(true)}
                  data-testid="button-start-onboarding"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Start New Onboarding
                </Button>
                <Button variant="outline" data-testid="button-send-welcome-kit">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Welcome Kit
                </Button>
                <Button variant="outline" data-testid="button-bulk-setup">
                  <Settings className="w-4 h-4 mr-2" />
                  Bulk System Setup
                </Button>
              </div>

              <Tabs defaultValue="active" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active" data-testid="tab-active">Active Onboarding</TabsTrigger>
                  <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
                  <TabsTrigger value="tasks" data-testid="tab-tasks">All Tasks</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-6">
                  {activeOnboarding.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Active Onboarding</h3>
                        <p className="text-sm text-muted-foreground mb-4">Start onboarding new employees to see them here.</p>
                        <Button onClick={() => setShowOnboardingFlow(true)} data-testid="button-start-first-onboarding">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Start First Onboarding
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {activeOnboarding.map((employee) => {
                        const tasks = getTasksForEmployee(employee.id);
                        const progress = getCompletionProgress(employee.id);
                        const completedTaskCount = tasks.filter(t => t.status === 'completed').length;
                        const daysSinceStart = Math.floor(
                          (new Date().getTime() - new Date(employee.startDate).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        
                        return (
                          <Card key={employee.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-foreground">
                                    {employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'XX'}
                                  </span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-foreground" data-testid={`employee-name-${employee.id}`}>
                                      {employee.name}
                                    </h4>
                                    <Badge className={getStatusColor(employee.status)} data-testid={`employee-status-${employee.id}`}>
                                      {employee.status}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground" data-testid={`employee-position-${employee.id}`}>
                                    {employee.position} • {employee.department}
                                  </p>
                                  
                                  <p className="text-sm text-muted-foreground">
                                    Start Date: {new Date(employee.startDate).toLocaleDateString()} • Day {daysSinceStart + 1}
                                  </p>
                                  
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span>Progress</span>
                                      <span className="font-medium" data-testid={`employee-progress-${employee.id}`}>
                                        {completedTaskCount}/{tasks.length} tasks completed
                                      </span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                                    <span>{progress}% complete</span>
                                    {progress === 100 && (
                                      <div className="flex items-center space-x-1 text-accent">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Ready to activate</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" data-testid={`button-view-tasks-${employee.id}`}>
                                    <Play className="w-4 h-4 mr-1" />
                                    View Tasks
                                  </Button>
                                  {progress === 100 && (
                                    <Button size="sm" data-testid={`button-complete-onboarding-${employee.id}`}>
                                      Complete Onboarding
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-6">
                  {completedOnboarding.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Completed Onboarding</h3>
                        <p className="text-sm text-muted-foreground">Employees who complete onboarding will appear here.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {completedOnboarding.map((employee) => {
                        const daysSinceStart = Math.floor(
                          (new Date().getTime() - new Date(employee.startDate).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        
                        return (
                          <Card key={employee.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-6 h-6 text-accent-foreground" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-foreground">{employee.name}</h4>
                                    <Badge className={getStatusColor(employee.status)}>Active Employee</Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground">
                                    {employee.position} • {employee.department}
                                  </p>
                                  
                                  <p className="text-sm text-muted-foreground">
                                    Started: {new Date(employee.startDate).toLocaleDateString()} • {daysSinceStart} days ago
                                  </p>
                                  
                                  <div className="flex items-center space-x-1 mt-2 text-sm text-accent">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Onboarding completed successfully</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tasks" className="space-y-6">
                  {onboardingTasks.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Onboarding Tasks</h3>
                        <p className="text-sm text-muted-foreground">Tasks will appear here when onboarding processes are started.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {onboardingTasks.map((task) => {
                        const employee = employees.find(emp => emp.id === task.employeeId);
                        
                        return (
                          <Card key={task.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  {getTaskStatusIcon(task.status)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-foreground" data-testid={`task-title-${task.id}`}>
                                      {task.title}
                                    </h4>
                                    <Badge 
                                      variant={task.status === 'completed' ? 'default' : 'secondary'}
                                      data-testid={`task-status-${task.id}`}
                                    >
                                      {task.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground">
                                    {employee?.name || 'Unknown Employee'} • {task.taskType.replace('_', ' ')}
                                  </p>
                                  
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                  )}
                                  
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                    <span>Created: {new Date(task.createdAt!).toLocaleDateString()}</span>
                                    {task.completedAt && (
                                      <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                                
                                {task.status !== 'completed' && (
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" data-testid={`button-complete-task-${task.id}`}>
                                      Mark Complete
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Onboarding Flow Modal */}
      <OnboardingFlow
        isOpen={showOnboardingFlow}
        onClose={() => setShowOnboardingFlow(false)}
      />
    </div>
  );
}
