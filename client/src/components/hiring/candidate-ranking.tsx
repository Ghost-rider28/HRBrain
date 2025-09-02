import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Calendar, Send } from "lucide-react";

interface CandidateRankingProps {
  isOpen: boolean;
  onClose: () => void;
  jobPostingId?: number;
}

export default function CandidateRanking({ isOpen, onClose, jobPostingId }: CandidateRankingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['/api/recruitment/rank-candidates', jobPostingId],
    queryFn: () => jobPostingId ? api.getRankedCandidates(jobPostingId) : Promise.resolve([]),
    enabled: isOpen && !!jobPostingId,
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: (data: any) => api.scheduleInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });
      toast({
        title: "Interview Scheduled",
        description: "Interview has been scheduled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Schedule",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendAssessmentMutation = useMutation({
    mutationFn: (data: any) => api.sendAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation/assessments'] });
      toast({
        title: "Assessment Sent",
        description: "Assessment has been sent to the candidate.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Failed to send assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScheduleInterview = (candidateId: number) => {
    // For demo purposes, we'll use a default scheduled time
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 1); // Tomorrow

    scheduleInterviewMutation.mutate({
      candidateId,
      interviewerId: 'current-user-id', // This would come from auth context
      scheduledAt: scheduledAt.toISOString(),
    });
  };

  const handleSendAssessment = (candidateId: number) => {
    // Default assessment questions
    const questions = [
      {
        id: 1,
        type: 'multiple_choice',
        question: 'What is your experience with React?',
        options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      },
      {
        id: 2,
        type: 'text',
        question: 'Describe a challenging project you worked on recently.',
      },
      {
        id: 3,
        type: 'multiple_choice',
        question: 'How do you prefer to work?',
        options: ['Independently', 'In small teams', 'In large teams', 'Both independently and in teams'],
      },
    ];

    sendAssessmentMutation.mutate({
      candidateId,
      testType: 'general_assessment',
      questions,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-accent text-accent-foreground';
    if (score >= 80) return 'bg-primary text-primary-foreground';
    if (score >= 70) return 'bg-secondary text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading candidates...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Candidate Ranking</DialogTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered skill matching and behavioral analysis
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No candidates found for this position.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate: any) => (
                <div 
                  key={candidate.id} 
                  className="flex items-center space-x-4 p-4 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {candidate.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'XX'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground" data-testid={`candidate-name-${candidate.id}`}>
                        {candidate.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getScoreColor(candidate.skillMatchScore || 0)} data-testid={`candidate-score-${candidate.id}`}>
                          {candidate.skillMatchScore || 0}% Match
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground" data-testid={`candidate-email-${candidate.id}`}>
                      {candidate.email}
                    </p>
                    
                    {candidate.notes && (
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`candidate-notes-${candidate.id}`}>
                        {candidate.notes}
                      </p>
                    )}
                    
                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        {candidate.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleScheduleInterview(candidate.id)}
                      disabled={scheduleInterviewMutation.isPending}
                      data-testid={`button-schedule-${candidate.id}`}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule Interview
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendAssessment(candidate.id)}
                      disabled={sendAssessmentMutation.isPending}
                      data-testid={`button-assess-${candidate.id}`}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {candidates.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {candidates.length} candidates ranked by AI analysis
              </div>
              <Button variant="outline" data-testid="button-export-report">
                Generate Summary Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
