import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import JobDescriptionGenerator from "@/components/hiring/job-description-generator";
import CandidateRanking from "@/components/hiring/candidate-ranking";
import ResumeUpload from "@/components/hiring/resume-upload";
import { 
  Plus, 
  Users, 
  FileText, 
  Calendar,
  Star,
  Clock,
  TrendingUp
} from "lucide-react";

export default function Hiring() {
  const [showJDGenerator, setShowJDGenerator] = useState(false);
  const [showCandidateRanking, setShowCandidateRanking] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number>();

  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/recruitment/job-postings'],
    queryFn: api.getJobPostings,
  }) as { data: any[], isLoading: boolean };

  const { data: candidates = [] } = useQuery({
    queryKey: ['/api/candidates'],
    queryFn: api.getCandidates,
  }) as { data: any[] };

  const { data: interviews = [] } = useQuery({
    queryKey: ['/api/interviews'],
    queryFn: api.getInterviews,
  }) as { data: any[] };

  const getJobCandidates = (jobId: number) => {
    return candidates.filter(c => c.jobPostingId === jobId);
  };

  const getJobInterviews = (jobId: number) => {
    const jobCandidates = getJobCandidates(jobId);
    return interviews.filter(i => jobCandidates.some(c => c.id === i.candidateId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent text-accent-foreground';
      case 'draft': return 'bg-secondary text-secondary-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-64">
        <Header title="Hiring & Recruitment" />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  onClick={() => setShowJDGenerator(true)}
                  data-testid="button-generate-jd"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Job Description
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowResumeUpload(true)}
                  data-testid="button-upload-resume"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Screen Resume
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (jobPostings.length > 0) {
                      setSelectedJobId(jobPostings[0].id);
                      setShowCandidateRanking(true);
                    }
                  }}
                  data-testid="button-rank-candidates"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Rank Candidates
                </Button>
              </div>

              <Tabs defaultValue="jobs" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="jobs" data-testid="tab-jobs">Job Postings</TabsTrigger>
                  <TabsTrigger value="candidates" data-testid="tab-candidates">Candidates</TabsTrigger>
                  <TabsTrigger value="interviews" data-testid="tab-interviews">Interviews</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="space-y-6">
                  {jobsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="h-3 bg-muted rounded"></div>
                              <div className="h-3 bg-muted rounded w-2/3"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : jobPostings.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Job Postings Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Start by creating your first job description with AI assistance.</p>
                        <Button onClick={() => setShowJDGenerator(true)} data-testid="button-create-first-job">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Job Posting
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {jobPostings.map((job) => {
                        const jobCandidates = getJobCandidates(job.id);
                        const jobInterviews = getJobInterviews(job.id);
                        const highMatchCandidates = jobCandidates.filter(c => c.skillMatchScore && c.skillMatchScore >= 80);
                        
                        return (
                          <Card key={job.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg" data-testid={`job-title-${job.id}`}>{job.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground">{job.department}</p>
                                </div>
                                <Badge className={getStatusColor(job.status)} data-testid={`job-status-${job.id}`}>
                                  {job.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="text-sm">
                                  <p className="text-muted-foreground">Experience: {job.experienceLevel}</p>
                                  {job.skills && job.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {job.skills.slice(0, 3).map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {job.skills.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{job.skills.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div>
                                    <div className="font-medium" data-testid={`job-candidates-${job.id}`}>
                                      {jobCandidates.length}
                                    </div>
                                    <div className="text-muted-foreground">Applied</div>
                                  </div>
                                  <div>
                                    <div className="font-medium" data-testid={`job-screened-${job.id}`}>
                                      {jobCandidates.filter(c => c.skillMatchScore).length}
                                    </div>
                                    <div className="text-muted-foreground">Screened</div>
                                  </div>
                                  <div>
                                    <div className="font-medium" data-testid={`job-interviews-${job.id}`}>
                                      {jobInterviews.length}
                                    </div>
                                    <div className="text-muted-foreground">Interviews</div>
                                  </div>
                                </div>

                                {highMatchCandidates.length > 0 && (
                                  <div className="flex items-center space-x-1 text-xs text-accent">
                                    <Star className="w-3 h-3" />
                                    <span>{highMatchCandidates.length} high matches</span>
                                  </div>
                                )}
                                
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedJobId(job.id);
                                      setShowCandidateRanking(true);
                                    }}
                                    data-testid={`button-view-candidates-${job.id}`}
                                  >
                                    <Users className="w-4 h-4 mr-1" />
                                    View Candidates
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="candidates" className="space-y-6">
                  {candidates.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Candidates Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Upload and screen resumes to start building your candidate pool.</p>
                        <Button onClick={() => setShowResumeUpload(true)} data-testid="button-upload-first-resume">
                          <FileText className="w-4 h-4 mr-2" />
                          Upload Resume
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {candidates.map((candidate) => {
                        const job = jobPostings.find(j => j.id === candidate.jobPostingId);
                        const candidateInterviews = interviews.filter(i => i.candidateId === candidate.id);
                        
                        return (
                          <Card key={candidate.id}>
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
                                    {candidate.skillMatchScore && (
                                      <Badge 
                                        className={candidate.skillMatchScore >= 80 ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}
                                        data-testid={`candidate-score-${candidate.id}`}
                                      >
                                        {candidate.skillMatchScore}% Match
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground" data-testid={`candidate-email-${candidate.id}`}>
                                    {candidate.email}
                                  </p>
                                  
                                  {job && (
                                    <p className="text-sm text-muted-foreground">Applied for: {job.title}</p>
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
                                    <span>Status: {candidate.status}</span>
                                    {candidateInterviews.length > 0 && (
                                      <span>{candidateInterviews.length} interview(s) scheduled</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" data-testid={`button-schedule-interview-${candidate.id}`}>
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Schedule Interview
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="interviews" className="space-y-6">
                  {interviews.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Interviews Scheduled</h3>
                        <p className="text-sm text-muted-foreground">Schedule interviews with qualified candidates to move forward in the hiring process.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {interviews.map((interview) => {
                        const candidate = candidates.find(c => c.id === interview.candidateId);
                        const isUpcoming = new Date(interview.scheduledAt) > new Date();
                        
                        return (
                          <Card key={interview.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  isUpcoming ? 'bg-accent' : 'bg-muted'
                                }`}>
                                  <Calendar className={`w-6 h-6 ${
                                    isUpcoming ? 'text-accent-foreground' : 'text-muted-foreground'
                                  }`} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-foreground">
                                      Interview with {candidate?.name || 'Unknown Candidate'}
                                    </h4>
                                    <Badge variant={isUpcoming ? 'default' : 'secondary'} data-testid={`interview-status-${interview.id}`}>
                                      {interview.status}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(interview.scheduledAt).toLocaleString()}
                                  </p>
                                  
                                  {interview.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">{interview.notes}</p>
                                  )}
                                  
                                  <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                                    {isUpcoming ? (
                                      <div className="flex items-center space-x-1 text-accent">
                                        <Clock className="w-4 h-4" />
                                        <span>Upcoming</span>
                                      </div>
                                    ) : (
                                      <span>Completed</span>
                                    )}
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
              </Tabs>
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
      
      <ResumeUpload
        isOpen={showResumeUpload}
        onClose={() => setShowResumeUpload(false)}
        jobPostings={jobPostings}
      />
    </div>
  );
}
