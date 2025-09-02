import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import AssessmentForm from "@/components/evaluation/assessment-form";
import { 
  Send, 
  BarChart3, 
  Clock, 
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Brain,
  Users
} from "lucide-react";

export default function Evaluation() {
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>();

  const { data: candidates = [] } = useQuery({
    queryKey: ['/api/candidates'],
    queryFn: api.getCandidates,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['/api/evaluation/assessments'],
    queryFn: () => api.getAssessments(),
  });

  const { data: jobPostings = [] } = useQuery({
    queryKey: ['/api/recruitment/job-postings'],
    queryFn: api.getJobPostings,
  });

  const getAssessmentsForCandidate = (candidateId: number) => {
    return assessments.filter(a => a.candidateId === candidateId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-accent';
    if (score >= 80) return 'text-primary';
    if (score >= 70) return 'text-secondary';
    return 'text-muted-foreground';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-accent text-accent-foreground';
    if (score >= 80) return 'bg-primary text-primary-foreground';
    if (score >= 70) return 'bg-secondary text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const completedAssessments = assessments.filter(a => a.completedAt);
  const pendingAssessments = assessments.filter(a => !a.completedAt);
  const averageScore = completedAssessments.length > 0 
    ? Math.round(completedAssessments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssessments.length)
    : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-64">
        <Header title="Candidate Evaluation" />
        
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
                          <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Total Assessments</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-total-assessments">
                            {assessments.length}
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
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-completed-assessments">
                            {completedAssessments.length}
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
                          <dt className="text-sm font-medium text-muted-foreground truncate">Pending</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-pending-assessments">
                            {pendingAssessments.length}
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
                          <Target className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Average Score</dt>
                          <dd className={`text-lg font-semibold ${getScoreColor(averageScore)}`} data-testid="stat-average-score">
                            {averageScore}%
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
                  onClick={() => setShowAssessmentForm(true)}
                  data-testid="button-send-assessment"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Assessment
                </Button>
                <Button variant="outline" data-testid="button-bulk-assess">
                  <Users className="w-4 h-4 mr-2" />
                  Bulk Assessment
                </Button>
                <Button variant="outline" data-testid="button-analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>

              <Tabs defaultValue="candidates" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="candidates" data-testid="tab-candidates">Candidates</TabsTrigger>
                  <TabsTrigger value="assessments" data-testid="tab-assessments">Assessments</TabsTrigger>
                  <TabsTrigger value="insights" data-testid="tab-insights">Behavioral Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="candidates" className="space-y-6">
                  {candidates.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Candidates Available</h3>
                        <p className="text-sm text-muted-foreground">Add candidates through the hiring process to start evaluations.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {candidates.map((candidate) => {
                        const candidateAssessments = getAssessmentsForCandidate(candidate.id);
                        const completedCount = candidateAssessments.filter(a => a.completedAt).length;
                        const latestScore = candidateAssessments
                          .filter(a => a.score)
                          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0]?.score;
                        const job = jobPostings.find(j => j.id === candidate.jobPostingId);
                        
                        return (
                          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-foreground">
                                    {candidate.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'XX'}
                                  </span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-foreground" data-testid={`candidate-name-${candidate.id}`}>
                                      {candidate.name}
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                      {latestScore && (
                                        <Badge className={getScoreBadgeColor(latestScore)} data-testid={`candidate-latest-score-${candidate.id}`}>
                                          {latestScore}%
                                        </Badge>
                                      )}
                                      {candidate.skillMatchScore && (
                                        <Badge variant="outline" data-testid={`candidate-skill-match-${candidate.id}`}>
                                          {candidate.skillMatchScore}% Match
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground" data-testid={`candidate-email-${candidate.id}`}>
                                    {candidate.email}
                                  </p>
                                  
                                  {job && (
                                    <p className="text-sm text-muted-foreground">Position: {job.title}</p>
                                  )}
                                  
                                  {candidate.tags && candidate.tags.length > 0 && (
                                    <div className="flex items-center space-x-2 mt-2">
                                      {candidate.tags.slice(0, 4).map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                                    <span data-testid={`candidate-assessments-${candidate.id}`}>
                                      {candidateAssessments.length} assessment(s) • {completedCount} completed
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedCandidateId(candidate.id);
                                      setShowAssessmentForm(true);
                                    }}
                                    data-testid={`button-send-test-${candidate.id}`}
                                  >
                                    <Send className="w-4 h-4 mr-1" />
                                    Send Test
                                  </Button>
                                  {candidateAssessments.length > 0 && (
                                    <Button size="sm" data-testid={`button-view-results-${candidate.id}`}>
                                      <BarChart3 className="w-4 h-4 mr-1" />
                                      View Results
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

                <TabsContent value="assessments" className="space-y-6">
                  {assessments.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Assessments Created</h3>
                        <p className="text-sm text-muted-foreground mb-4">Start by sending assessments to candidates for evaluation.</p>
                        <Button onClick={() => setShowAssessmentForm(true)} data-testid="button-create-first-assessment">
                          <Send className="w-4 h-4 mr-2" />
                          Send First Assessment
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {assessments.map((assessment) => {
                        const candidate = candidates.find(c => c.id === assessment.candidateId);
                        const isCompleted = !!assessment.completedAt;
                        
                        return (
                          <Card key={assessment.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  isCompleted ? 'bg-accent' : 'bg-secondary'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-accent-foreground" />
                                  ) : (
                                    <Clock className="w-6 h-6 text-secondary-foreground" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-foreground">
                                      {assessment.testType.replace('_', ' ').toUpperCase()} - {candidate?.name || 'Unknown Candidate'}
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                      {assessment.score && (
                                        <Badge className={getScoreBadgeColor(assessment.score)} data-testid={`assessment-score-${assessment.id}`}>
                                          {assessment.score}%
                                        </Badge>
                                      )}
                                      <Badge variant={isCompleted ? 'default' : 'secondary'} data-testid={`assessment-status-${assessment.id}`}>
                                        {isCompleted ? 'Completed' : 'Pending'}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground">
                                    Created: {new Date(assessment.createdAt!).toLocaleDateString()}
                                  </p>
                                  
                                  {isCompleted && (
                                    <p className="text-sm text-muted-foreground">
                                      Completed: {new Date(assessment.completedAt!).toLocaleDateString()}
                                    </p>
                                  )}
                                  
                                  {assessment.responseTime && (
                                    <p className="text-sm text-muted-foreground">
                                      Response time: {Math.round(assessment.responseTime / 60)} minutes
                                    </p>
                                  )}
                                  
                                  {assessment.behavioralCues && assessment.behavioralCues.length > 0 && (
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Brain className="w-4 h-4 text-muted-foreground" />
                                      <div className="flex flex-wrap gap-1">
                                        {assessment.behavioralCues.slice(0, 3).map((cue, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {cue}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {isCompleted && (
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" data-testid={`button-view-details-${assessment.id}`}>
                                      View Details
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

                <TabsContent value="insights" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Behavioral Traits Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Brain className="w-5 h-5 text-primary" />
                          <span>Behavioral Traits</span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Most common traits identified by AI</p>
                      </CardHeader>
                      <CardContent>
                        {completedAssessments.length === 0 ? (
                          <div className="text-center py-8">
                            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No behavioral data available yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* This would be populated with actual behavioral insights from assessments */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Problem Solving</span>
                              <Badge variant="outline">67% of candidates</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Team Collaboration</span>
                              <Badge variant="outline">54% of candidates</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Leadership Potential</span>
                              <Badge variant="outline">43% of candidates</Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-accent" />
                          <span>Performance Metrics</span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Assessment performance overview</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>High Performers (90%+)</span>
                              <span>{completedAssessments.filter(a => a.score && a.score >= 90).length}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-accent h-2 rounded-full" 
                                style={{ 
                                  width: `${completedAssessments.length > 0 ? 
                                    (completedAssessments.filter(a => a.score && a.score >= 90).length / completedAssessments.length) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Good Performers (70-89%)</span>
                              <span>{completedAssessments.filter(a => a.score && a.score >= 70 && a.score < 90).length}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ 
                                  width: `${completedAssessments.length > 0 ? 
                                    (completedAssessments.filter(a => a.score && a.score >= 70 && a.score < 90).length / completedAssessments.length) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Below Average (&lt;70%)</span>
                              <span>{completedAssessments.filter(a => a.score && a.score < 70).length}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-destructive h-2 rounded-full" 
                                style={{ 
                                  width: `${completedAssessments.length > 0 ? 
                                    (completedAssessments.filter(a => a.score && a.score < 70).length / completedAssessments.length) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Assessment Form Modal */}
      <AssessmentForm
        isOpen={showAssessmentForm}
        onClose={() => {
          setShowAssessmentForm(false);
          setSelectedCandidateId(undefined);
        }}
        candidates={candidates}
        selectedCandidateId={selectedCandidateId}
      />
    </div>
  );
}
