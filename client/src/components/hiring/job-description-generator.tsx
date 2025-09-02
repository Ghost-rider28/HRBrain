import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Zap } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),
  skills: z.string().min(1, "Skills are required"),
  culture: z.string().optional(),
});

interface JobDescriptionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated?: (data: any) => void;
}

export default function JobDescriptionGenerator({ isOpen, onClose, onGenerated }: JobDescriptionGeneratorProps) {
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      department: "",
      experienceLevel: "",
      skills: "",
      culture: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: api.generateJobDescription,
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Job Description Generated",
        description: "AI has successfully created your job description.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate job description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: api.createJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruitment/job-postings'] });
      toast({
        title: "Job Posted",
        description: "Job posting has been created successfully.",
      });
      onGenerated?.(generatedContent);
      handleClose();
    },
    onError: () => {
      toast({
        title: "Failed to Create Job",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!generatedContent) {
      generateMutation.mutate({
        ...values,
        culture: values.culture || ""
      });
    } else {
      // Create the job posting
      createJobMutation.mutate({
        title: values.title,
        department: values.department,
        experienceLevel: values.experienceLevel,
        skills: values.skills.split(',').map(s => s.trim()),
        description: generatedContent.description,
        requirements: generatedContent.requirements,
        benefits: generatedContent.benefits,
        createdBy: 'current-user-id', // This would come from auth context
      });
    }
  };

  const handleClose = () => {
    setGeneratedContent(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>AI Job Description Generator</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create tailored job descriptions with AI assistance
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {!generatedContent ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Full Stack Developer" {...field} data-testid="input-job-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Experience Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-3"
                        >
                          <div className="flex items-center space-x-2 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="junior" id="junior" />
                            <Label htmlFor="junior" className="text-sm cursor-pointer">Junior (0-2 years)</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="mid" id="mid" />
                            <Label htmlFor="mid" className="text-sm cursor-pointer">Mid (3-5 years)</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="senior" id="senior" />
                            <Label htmlFor="senior" className="text-sm cursor-pointer">Senior (5+ years)</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Skills & Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="List the essential skills, technologies, and qualifications..."
                          {...field}
                          data-testid="textarea-skills"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="culture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Culture & Benefits</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Describe your company culture, benefits, and what makes you unique..."
                          {...field}
                          data-testid="textarea-culture"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">AI will generate a complete, optimized job description</span>
                  </div>
                  <div className="flex space-x-3">
                    <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={generateMutation.isPending}
                      data-testid="button-generate"
                    >
                      {generateMutation.isPending ? 'Generating...' : 'Generate with AI'}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Generated Job Description</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Description</h4>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-foreground whitespace-pre-line" data-testid="generated-description">
                        {generatedContent.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Requirements</h4>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-foreground whitespace-pre-line" data-testid="generated-requirements">
                        {generatedContent.requirements}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Benefits</h4>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-foreground whitespace-pre-line" data-testid="generated-benefits">
                        {generatedContent.benefits}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setGeneratedContent(null)} data-testid="button-regenerate">
                  Regenerate
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleClose} data-testid="button-cancel-generated">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={createJobMutation.isPending}
                    data-testid="button-create-job"
                  >
                    {createJobMutation.isPending ? 'Creating...' : 'Create Job Posting'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
