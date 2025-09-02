import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { 
  Users, 
  Calendar, 
  UserPlus, 
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react";
import { useState } from "react";
import JobDescriptionGenerator from "@/components/hiring/job-description-generator";
import CandidateRanking from "@/components/hiring/candidate-ranking";
import type { Candidate, JobPosting, Employee, Reminder } from "@shared/schema";

export default function Dashboard() {
  const [showJDGenerator, setShowJDGenerator] = useState(false);
  const [showCandidateRanking, setShowCandidateRanking] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number>();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: jobPostings = [] } = useQuery({
    queryKey: ['/api/recruitment/job-postings'],
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['/api/candidates'],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/onboarding/employees'],
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['/api/support/reminders'],
  });

  const recentActivities = [
    {
      id: 1,
      type: 'screening',
      title: 'Resume screening completed',
      description: `${candidates.filter(c => c.skillMatchScore && c.skillMatchScore > 80).length} high matches found`,
      time: '2 hours ago',
      icon: CheckCircle,
      iconColor: 'text-accent',
    },
    {
      id: 2,
      type: 'job_description',
      title: 'AI generated job description',
      description: 'Ready for review and publishing',
      time: '4 hours ago',
      icon: FileText,
      iconColor: 'text-primary',
    },
    {
      id: 3,
      type: 'onboarding',
      title: 'Onboarding checklist completed',
      description: 'All system accounts created successfully',
      time: 'Yesterday',
      icon: UserPlus,
      iconColor: 'text-secondary',
    },
  ];

  const pipelineData = [
    { stage: 'Applied', count: candidates.filter(c => c.status === 'applied').length, color: 'bg-primary' },
    { stage: 'Screened', count: candidates.filter(c => c.skillMatchScore).length, color: 'bg-accent' },
    { stage: 'Interviewed', count: candidates.filter(c => c.status === 'interviewed').length, color: 'bg-secondary' },
    { stage: 'Offers Extended', count: candidates.filter(c => c.status === 'offer_extended').length, color: 'bg-muted' },
  ];

  const activeOnboarding = employees.filter(e => e.status === 'onboarding');
  const pendingReminders = reminders.filter(r => r.status === 'active');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-64">
        <Header title="Dashboard" />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatsCard
                  title="Active Candidates"
                  value={statsLoading ? "..." : stats?.activeCandidates || 0}
                  icon={Users}
                  iconColor="text-primary"
                  iconBgColor="bg-primary/10"
                />
                <StatsCard
                  title="Interviews Scheduled"
                  value={statsLoading ? "..." : stats?.scheduledInterviews || 0}
                  icon={Calendar}
                  iconColor="text-accent"
                  iconBgColor="bg-accent/10"
                />
                <StatsCard
                  title="New Hires This Month"
                  value={statsLoading ? "..." : stats?.newHires || 0}
                  icon={UserPlus}
                  iconColor="text-secondary"
                  iconBgColor="bg-secondary/10"
                />
                <StatsCard
                  title="AI Queries Today"
                  value={statsLoading ? "..." : stats?.aiQueries || 0}
                  icon={MessageSquare}
                  iconColor="text-muted-foreground"
                  iconBgColor="bg-muted"
                />
              </div>

              {/* Quick Actions */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <p className="text-sm text-muted-foreground">AI-powered HR workflows at your fingertips</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center p-6 h-auto border-2 border-dashed border-primary/20 hover:border-primary/30 hover:bg-primary/5"
                      onClick={() => setShowJDGenerator(true)}
                      data-testid="quick-action-generate-jd"
                    >
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Generate Job Description</h4>
                      <p className="text-xs text-muted-foreground text-center">AI-powered JD creation for any role</p>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex flex-col items-center p-6 h-auto border-2 border-dashed border-accent/20 hover:border-accent/30 hover:bg-accent/5"
                      onClick={() => {
                        if (jobPostings.length > 0) {
                          setSelectedJobId(jobPostings[0].id);
                          setShowCandidateRanking(true);
                        }
                      }}
                      data-testid="quick-action-screen-resumes"
                    >
                      <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Screen Resumes</h4>
                      <p className="text-xs text-muted-foreground text-center">Smart keyword & skill matching</p>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex flex-col items-center p-6 h-auto border-2 border-dashed border-secondary/20 hover:border-secondary/30 hover:bg-secondary/5"
                      data-testid="quick-action-send-assessment"
                    >
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-3">
                        <UserPlus className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Send Assessment</h4>
                      <p className="text-xs text-muted-foreground text-center">Role-specific smart tests</p>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex flex-col items-center p-6 h-auto border-2 border-dashed border-border hover:border-muted-foreground/30 hover:bg-muted"
                      data-testid="quick-action-start-onboarding"
                    >
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Start Onboarding</h4>
                      <p className="text-xs text-muted-foreground text-center">Automated welcome process</p>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity & Hiring Pipeline */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <p className="text-sm text-muted-foreground">Latest updates across all HR processes</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity) => {
                          const Icon = activity.icon;
                          return (
                            <div key={activity.id} className="flex space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                activity.type === 'screening' ? 'bg-accent' :
                                activity.type === 'job_description' ? 'bg-primary' : 'bg-secondary'
                              }`}>
                                <Icon className={`w-4 h-4 ${
                                  activity.type === 'screening' ? 'text-accent-foreground' :
                                  activity.type === 'job_description' ? 'text-primary-foreground' : 'text-secondary-foreground'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Hiring Pipeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hiring Pipeline</CardTitle>
                    <p className="text-sm text-muted-foreground">Current status overview</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pipelineData.map((stage, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 ${stage.color} rounded-full`}></div>
                            <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                          </div>
                          <span className="text-sm text-muted-foreground" data-testid={`pipeline-${stage.stage.toLowerCase().replace(' ', '-')}`}>
                            {stage.count}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">Conversion Rate</span>
                        <span className="text-accent font-semibold">
                          {candidates.length > 0 ? Math.round((pipelineData[3].count / pipelineData[0].count) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Modules Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
                {/* Hiring & Recruitment Module */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Hiring & Recruitment</CardTitle>
                      <p className="text-sm text-muted-foreground">AI-powered hiring funnel management</p>
                    </div>
                    <Button size="sm" data-testid="view-all-hiring">View All</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobPostings.slice(0, 2).map((job) => {
                        const jobCandidates = candidates.filter(c => c.jobPostingId === job.id);
                        return (
                          <div key={job.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-foreground">{job.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {jobCandidates.length} applications • {jobCandidates.filter(c => c.skillMatchScore).length} screened
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {job.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(job.createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowJDGenerator(true)}
                        data-testid="create-job-description"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Job Description
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Onboarding & Support Module */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Onboarding & Support</CardTitle>
                      <p className="text-sm text-muted-foreground">Active processes and support queries</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeOnboarding.slice(0, 2).map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-accent" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground">{employee.name}</h4>
                            <p className="text-xs text-muted-foreground">{employee.position} • {employee.department}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="text-xs text-accent">In progress</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-semibold text-foreground" data-testid="support-queries-today">
                            {stats?.aiQueries || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Queries Today</div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-semibold text-foreground" data-testid="active-reminders">
                            {pendingReminders.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Active Reminders</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Reminders & Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Reminders & Tasks</CardTitle>
                  <p className="text-sm text-muted-foreground">Automated notifications and deadline tracking</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingReminders.slice(0, 3).map((reminder) => (
                      <div key={reminder.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground">{reminder.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {reminder.description} • Due {new Date(reminder.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {reminder.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {pendingReminders.length === 0 && (
                      <div className="text-center py-8">
                        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No upcoming reminders</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <JobDescriptionGenerator
        isOpen={showJDGenerator}
        onClose={() => setShowJDGenerator(false)}
      />
      
      <CandidateRanking
        isOpen={showCandidateRanking}
        onClose={() => setShowCandidateRanking(false)}
        jobPostingId={selectedJobId}
      />
    </div>
  );
}
