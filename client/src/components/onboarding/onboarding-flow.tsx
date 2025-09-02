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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { 
  UserPlus, 
  Calendar as CalendarIcon, 
  Mail, 
  Settings, 
  CheckCircle,
  Clock,
  User,
  Building
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Employee name is required"),
  email: z.string().email("Valid email is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  candidateId: z.string().optional(),
});

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const departments = [
  'Engineering',
  'Product',
  'Design', 
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Success',
  'Legal'
];

const onboardingTasks = [
  {
    id: 'welcome_kit',
    title: 'Send Welcome Kit',
    description: 'Email welcome package with company information and first-day details',
    icon: Mail,
    automated: true,
    estimatedTime: '5 minutes',
  },
  {
    id: 'system_setup',
    title: 'System Account Setup',
    description: 'Create email, Slack, HRMS, and other necessary system accounts',
    icon: Settings,
    automated: true,
    estimatedTime: '15 minutes',
  },
  {
    id: 'documentation',
    title: 'Complete Documentation',
    description: 'Collect required HR forms, tax documents, and policy acknowledgments',
    icon: CheckCircle,
    automated: false,
    estimatedTime: '30 minutes',
  },
  {
    id: 'orientation',
    title: 'Schedule Orientation',
    description: 'Arrange company orientation and team introduction sessions',
    icon: User,
    automated: false,
    estimatedTime: '2 hours',
  },
  {
    id: 'equipment',
    title: 'Equipment Setup',
    description: 'Prepare and configure work equipment (laptop, phone, accessories)',
    icon: Building,
    automated: false,
    estimatedTime: '1 hour',
  },
];

export default function OnboardingFlow({ isOpen, onClose }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    onboardingTasks.map(task => task.id)
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      position: "",
      candidateId: "",
    },
  });

  const startOnboardingMutation = useMutation({
    mutationFn: api.startOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/tasks'] });
      toast({
        title: "Onboarding Started",
        description: "Employee onboarding process has been initiated successfully.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Failed to Start Onboarding",
        description: "There was an error starting the onboarding process. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setStep(1);
    setSelectedTasks(onboardingTasks.map(task => task.id));
    form.reset();
    onClose();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (step === 1) {
      setStep(2);
    } else {
      // Start onboarding with selected tasks
      startOnboardingMutation.mutate({
        name: values.name,
        email: values.email,
        department: values.department,
        position: values.position,
        startDate: values.startDate.toISOString(),
        candidateId: values.candidateId ? parseInt(values.candidateId) : undefined,
      });
    }
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const totalEstimatedTime = selectedTasks.reduce((total, taskId) => {
    const task = onboardingTasks.find(t => t.id === taskId);
    if (!task) return total;
    
    const timeMatch = task.estimatedTime.match(/(\d+)/);
    const minutes = timeMatch ? parseInt(timeMatch[1]) : 0;
    const isHours = task.estimatedTime.includes('hour');
    
    return total + (isHours ? minutes * 60 : minutes);
  }, 0);

  const formatTotalTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <span>Start New Employee Onboarding</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Set up automated onboarding workflow for new employees
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
              }`}>
                1
              </div>
              <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
              }`}>
                2
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-4">Employee Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} data-testid="input-employee-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@company.com" {...field} data-testid="input-employee-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                                {departments.map((dept) => (
                                  <SelectItem key={dept} value={dept.toLowerCase()}>
                                    {dept}
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
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input placeholder="Software Engineer" {...field} data-testid="input-position" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    }`}
                                    data-testid="select-start-date"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick start date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="candidateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Candidate ID (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Link to existing candidate" 
                                {...field} 
                                data-testid="input-candidate-id"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-4">Onboarding Tasks</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Select the tasks to include in the onboarding workflow. Automated tasks will be triggered immediately.
                    </p>
                    
                    <div className="space-y-4">
                      {onboardingTasks.map((task) => {
                        const Icon = task.icon;
                        const isSelected = selectedTasks.includes(task.id);
                        
                        return (
                          <Card 
                            key={task.id} 
                            className={`cursor-pointer transition-all ${
                              isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/30'
                            }`}
                            onClick={() => toggleTask(task.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => toggleTask(task.id)}
                                  data-testid={`task-checkbox-${task.id}`}
                                />
                                
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  task.automated ? 'bg-accent/10' : 'bg-secondary/10'
                                }`}>
                                  <Icon className={`w-5 h-5 ${
                                    task.automated ? 'text-accent' : 'text-secondary'
                                  }`} />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                                    <div className="flex items-center space-x-2">
                                      {task.automated && (
                                        <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md">
                                          Automated
                                        </span>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {task.estimatedTime}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Estimated Total Time:</span>
                        </div>
                        <span className="text-sm font-medium text-primary" data-testid="total-estimated-time">
                          {formatTotalTime(totalEstimatedTime)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedTasks.filter(id => onboardingTasks.find(t => t.id === id)?.automated).length} automated tasks, {' '}
                        {selectedTasks.filter(id => !onboardingTasks.find(t => t.id === id)?.automated).length} manual tasks
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  {step === 1 ? (
                    <>
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Step 1: Employee details</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span className="text-xs text-muted-foreground">Step 2: Configure onboarding tasks</span>
                    </>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  {step === 2 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={startOnboardingMutation.isPending}
                    data-testid={step === 1 ? "button-next" : "button-start-onboarding"}
                  >
                    {startOnboardingMutation.isPending ? (
                      <>Starting...</>
                    ) : step === 1 ? (
                      <>Next</>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Start Onboarding
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
