import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Send, Plus, Trash2, Brain } from "lucide-react";

const questionSchema = z.object({
  id: z.number(),
  type: z.enum(['multiple_choice', 'text', 'rating']),
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});

const formSchema = z.object({
  candidateId: z.string().min(1, "Candidate is required"),
  testType: z.string().min(1, "Test type is required"),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

interface AssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: any[];
  selectedCandidateId?: number;
}

const testTypes = [
  { value: 'general_assessment', label: 'General Assessment' },
  { value: 'technical_skills', label: 'Technical Skills' },
  { value: 'communication', label: 'Communication Skills' },
  { value: 'leadership', label: 'Leadership Assessment' },
  { value: 'behavioral', label: 'Behavioral Analysis' },
  { value: 'cognitive', label: 'Cognitive Abilities' },
];

const defaultQuestions = {
  general_assessment: [
    {
      id: 1,
      type: 'multiple_choice' as const,
      question: 'How do you prefer to work?',
      options: ['Independently', 'In small teams', 'In large teams', 'Both independently and in teams'],
      required: true,
    },
    {
      id: 2,
      type: 'text' as const,
      question: 'Describe a challenging project you worked on recently and how you overcame obstacles.',
      required: true,
    },
    {
      id: 3,
      type: 'rating' as const,
      question: 'Rate your communication skills on a scale of 1-5.',
      options: ['1', '2', '3', '4', '5'],
      required: true,
    },
  ],
  technical_skills: [
    {
      id: 1,
      type: 'multiple_choice' as const,
      question: 'What is your experience level with the primary technology stack for this role?',
      options: ['Beginner (0-1 years)', 'Intermediate (2-3 years)', 'Advanced (4-5 years)', 'Expert (5+ years)'],
      required: true,
    },
    {
      id: 2,
      type: 'text' as const,
      question: 'Describe a complex technical problem you solved and the approach you took.',
      required: true,
    },
  ],
  communication: [
    {
      id: 1,
      type: 'text' as const,
      question: 'Describe a time when you had to explain a complex concept to someone without technical background.',
      required: true,
    },
    {
      id: 2,
      type: 'multiple_choice' as const,
      question: 'How do you handle disagreements in a team setting?',
      options: ['Avoid confrontation', 'Address directly with the person', 'Seek mediation', 'Escalate to management'],
      required: true,
    },
  ],
};

export default function AssessmentForm({ isOpen, onClose, candidates, selectedCandidateId }: AssessmentFormProps) {
  const [customQuestions, setCustomQuestions] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateId: selectedCandidateId?.toString() || "",
      testType: "",
      questions: [],
    },
  });

  const sendAssessmentMutation = useMutation({
    mutationFn: api.sendAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation/assessments'] });
      toast({
        title: "Assessment Sent",
        description: "Assessment has been sent to the candidate successfully.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Failed to Send Assessment",
        description: "There was an error sending the assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTestTypeChange = (testType: string) => {
    const questions = defaultQuestions[testType as keyof typeof defaultQuestions] || [];
    form.setValue('questions', questions);
    setCustomQuestions([]);
  };

  const addCustomQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'text' as const,
      question: '',
      required: true,
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  const updateCustomQuestion = (index: number, field: string, value: any) => {
    const updated = [...customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomQuestions(updated);
  };

  const removeCustomQuestion = (index: number) => {
    const updated = customQuestions.filter((_, i) => i !== index);
    setCustomQuestions(updated);
  };

  const handleClose = () => {
    form.reset();
    setCustomQuestions([]);
    onClose();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const allQuestions = [...values.questions, ...customQuestions.filter(q => q.question.trim())];
    
    sendAssessmentMutation.mutate({
      candidateId: parseInt(values.candidateId),
      testType: values.testType,
      questions: allQuestions,
    });
  };

  const currentQuestions = form.watch('questions') || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Send Assessment Test</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create and send customized assessments to evaluate candidates
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="candidateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-candidate">
                            <SelectValue placeholder="Select candidate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {candidates.map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id.toString()}>
                              {candidate.name} - {candidate.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="testType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleTestTypeChange(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-test-type">
                            <SelectValue placeholder="Select assessment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {testTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Default Questions */}
              {currentQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Assessment Questions</h3>
                  {currentQuestions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-foreground">
                              Question {index + 1}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                                {question.type.replace('_', ' ')}
                              </span>
                              {question.required && (
                                <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-md">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-foreground">{question.question}</p>
                          
                          {question.options && (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Options:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="text-xs p-2 bg-muted/30 rounded">
                                    {option}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Custom Questions */}
              {customQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Custom Questions</h3>
                  {customQuestions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-foreground">
                              Custom Question {index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCustomQuestion(index)}
                              data-testid={`remove-question-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                              <Label htmlFor={`question-${index}`}>Question Text</Label>
                              <Textarea
                                id={`question-${index}`}
                                placeholder="Enter your question..."
                                value={question.question}
                                onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                                data-testid={`custom-question-text-${index}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`type-${index}`}>Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value) => updateCustomQuestion(index, 'type', value)}
                              >
                                <SelectTrigger data-testid={`custom-question-type-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text Response</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                  <SelectItem value="rating">Rating Scale</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {question.type === 'multiple_choice' && (
                            <div>
                              <Label>Options (one per line)</Label>
                              <Textarea
                                placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                                value={question.options?.join('\n') || ''}
                                onChange={(e) => updateCustomQuestion(index, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                                data-testid={`custom-question-options-${index}`}
                              />
                            </div>
                          )}

                          {question.type === 'rating' && (
                            <div>
                              <Label>Rating Scale</Label>
                              <Select
                                value={question.options?.[0] || '5'}
                                onValueChange={(value) => {
                                  const scale = parseInt(value);
                                  const options = Array.from({ length: scale }, (_, i) => (i + 1).toString());
                                  updateCustomQuestion(index, 'options', options);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">1-3 Scale</SelectItem>
                                  <SelectItem value="5">1-5 Scale</SelectItem>
                                  <SelectItem value="10">1-10 Scale</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add Custom Question Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomQuestion}
                  data-testid="add-custom-question"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Question
                </Button>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">
                    Assessment will be automatically scored by AI
                  </span>
                </div>
                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sendAssessmentMutation.isPending}
                    data-testid="button-send-assessment"
                  >
                    {sendAssessmentMutation.isPending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Assessment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
