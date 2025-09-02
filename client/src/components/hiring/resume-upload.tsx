import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Upload, FileText } from "lucide-react";

const formSchema = z.object({
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateEmail: z.string().email("Valid email is required"),
  candidatePhone: z.string().optional(),
  jobPostingId: z.string().min(1, "Job posting is required"),
  resume: z.any().refine((files) => files?.length > 0, "Resume is required"),
});

interface ResumeUploadProps {
  isOpen: boolean;
  onClose: () => void;
  jobPostings?: any[];
}

export default function ResumeUpload({ isOpen, onClose, jobPostings = [] }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      jobPostingId: "",
    },
  });

  const screenResumeMutation = useMutation({
    mutationFn: (formData: FormData) => api.screenResume(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Resume Screened",
        description: `Candidate ${data.candidate.name} has been screened with a ${data.screening.score}% match.`,
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Screening Failed",
        description: "Failed to screen resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('candidateName', values.candidateName);
    formData.append('candidateEmail', values.candidateEmail);
    if (values.candidatePhone) formData.append('candidatePhone', values.candidatePhone);
    formData.append('jobPostingId', values.jobPostingId);
    formData.append('resume', values.resume[0]);

    screenResumeMutation.mutate(formData);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        form.setValue('resume', e.dataTransfer.files);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      form.setValue('resume', e.target.files);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Screen Resume with AI</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload candidate resume for AI-powered skill matching
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} data-testid="input-candidate-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="candidateEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} data-testid="input-candidate-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="candidatePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-candidate-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobPostingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-job-posting">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobPostings.map((job) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.title} - {job.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume (PDF)</FormLabel>
                  <FormControl>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      data-testid="resume-dropzone"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-foreground font-medium mb-1">
                        Drop resume here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        PDF files only, max 10MB
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload"
                        data-testid="resume-input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        data-testid="button-browse"
                      >
                        Browse Files
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">AI will analyze skills and provide match score</span>
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={screenResumeMutation.isPending}
                  data-testid="button-screen"
                >
                  {screenResumeMutation.isPending ? 'Screening...' : 'Screen Resume'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
