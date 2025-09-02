import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import ChatInterface from "@/components/support/chat-interface";
import { 
  MessageCircle, 
  FileText, 
  Bell, 
  Download,
  Search,
  HelpCircle,
  Calendar,
  Zap,
  Users,
  TrendingUp
} from "lucide-react";

export default function Support() {
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents = [] } = useQuery({
    queryKey: ['/api/support/documents'],
    queryFn: () => api.getDocuments(),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['/api/support/reminders'],
    queryFn: () => api.getReminders(),
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['/api/support/chat-messages'],
    queryFn: () => api.getChatMessages(),
  });

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const documentCategories = [
    { name: 'HR Policies', count: documents.filter(d => d.category === 'hr_policy').length, icon: FileText },
    { name: 'Benefits', count: documents.filter(d => d.category === 'benefits').length, icon: Users },
    { name: 'Leave Forms', count: documents.filter(d => d.category === 'leave').length, icon: Calendar },
    { name: 'Reimbursements', count: documents.filter(d => d.category === 'reimbursement').length, icon: TrendingUp },
  ];

  const activeReminders = reminders.filter(r => r.status === 'active');
  const todayMessages = chatMessages.filter(msg => {
    const msgDate = new Date(msg.createdAt!);
    const today = new Date();
    return msgDate.toDateString() === today.toDateString();
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr_policy': return <FileText className="w-4 h-4" />;
      case 'benefits': return <Users className="w-4 h-4" />;
      case 'leave': return <Calendar className="w-4 h-4" />;
      case 'reimbursement': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-64">
        <Header title="Employee Support" />
        
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
                          <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">AI Queries Today</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-queries-today">
                            {todayMessages.length}
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
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Available Documents</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-documents">
                            {documents.length}
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
                          <Bell className="w-5 h-5 text-secondary" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Active Reminders</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-reminders">
                            {activeReminders.length}
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
                          <Zap className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">Response Rate</dt>
                          <dd className="text-lg font-semibold text-foreground" data-testid="stat-response-rate">
                            98%
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
                  onClick={() => setShowChatInterface(true)}
                  data-testid="button-open-chat"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open AI Assistant
                </Button>
                <Button variant="outline" data-testid="button-create-reminder">
                  <Bell className="w-4 h-4 mr-2" />
                  Create Reminder
                </Button>
                <Button variant="outline" data-testid="button-upload-document">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>

              <Tabs defaultValue="chat" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chat" data-testid="tab-chat">AI Assistant</TabsTrigger>
                  <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
                  <TabsTrigger value="reminders" data-testid="tab-reminders">Reminders</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* AI Assistant Overview */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <MessageCircle className="w-5 h-5 text-primary" />
                            <span>AI HR Assistant</span>
                            <div className="flex items-center space-x-1 ml-auto">
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                              <span className="text-xs text-muted-foreground">Online</span>
                            </div>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            24/7 intelligent support for all your HR queries
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-foreground mb-3">Common Queries</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                  "How do I submit a leave request?",
                                  "What are my health benefits?",
                                  "How to claim reimbursements?",
                                  "Policy on remote work?"
                                ].map((query, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="justify-start text-xs h-auto py-2"
                                    onClick={() => setShowChatInterface(true)}
                                    data-testid={`quick-query-${index}`}
                                  >
                                    <HelpCircle className="w-3 h-3 mr-2" />
                                    {query}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <Button onClick={() => setShowChatInterface(true)} data-testid="button-start-chat">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Start New Conversation
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <p className="text-sm text-muted-foreground">Latest support interactions</p>
                      </CardHeader>
                      <CardContent>
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No recent conversations</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chatMessages.slice(0, 5).map((message) => (
                              <div key={message.id} className="space-y-2">
                                <div className="text-xs text-muted-foreground">
                                  {new Date(message.createdAt!).toLocaleString()}
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3">
                                  <p className="text-sm text-foreground font-medium mb-1">
                                    {message.message}
                                  </p>
                                  {message.response && (
                                    <p className="text-xs text-muted-foreground">
                                      {message.response.substring(0, 100)}...
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                  {/* Document Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {documentCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-foreground">{category.name}</h4>
                                <p className="text-xs text-muted-foreground">{category.count} documents</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Search and Documents */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Document Library</CardTitle>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                            data-testid="search-documents"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredDocuments.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            {searchQuery ? 'No documents found' : 'No documents available'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? 'Try adjusting your search terms.' : 'Documents will appear here when uploaded.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredDocuments.map((document) => (
                            <div
                              key={document.id}
                              className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex-shrink-0">
                                {getCategoryIcon(document.category)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground" data-testid={`document-title-${document.id}`}>
                                  {document.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {document.category.replace('_', ' ')} • {new Date(document.createdAt!).toLocaleDateString()}
                                </p>
                                {document.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{document.description}</p>
                                )}
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" data-testid={`button-download-${document.id}`}>
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reminders" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="w-5 h-5 text-primary" />
                        <span>Smart Reminders</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Automated notifications for important dates and deadlines
                      </p>
                    </CardHeader>
                    <CardContent>
                      {reminders.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">No Reminders Set</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create smart reminders for important HR deadlines and events.
                          </p>
                          <Button data-testid="button-create-first-reminder">
                            <Bell className="w-4 h-4 mr-2" />
                            Create First Reminder
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reminders.map((reminder) => {
                            const dueDate = new Date(reminder.dueDate);
                            const isOverdue = dueDate < new Date();
                            const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            
                            return (
                              <div
                                key={reminder.id}
                                className="flex items-center space-x-4 p-4 border border-border rounded-lg"
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isOverdue ? 'bg-destructive/10' : daysUntilDue <= 3 ? 'bg-primary/10' : 'bg-muted'
                                }`}>
                                  <Bell className={`w-4 h-4 ${
                                    isOverdue ? 'text-destructive' : daysUntilDue <= 3 ? 'text-primary' : 'text-muted-foreground'
                                  }`} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-foreground" data-testid={`reminder-title-${reminder.id}`}>
                                    {reminder.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">{reminder.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Due: {dueDate.toLocaleDateString()}
                                    {isOverdue ? ' (Overdue)' : daysUntilDue <= 3 ? ` (${daysUntilDue} days)` : ''}
                                  </p>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant={reminder.status === 'active' ? 'default' : 'secondary'}
                                    data-testid={`reminder-status-${reminder.id}`}
                                  >
                                    {reminder.status}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Chat Interface Modal */}
      <ChatInterface
        isOpen={showChatInterface}
        onClose={() => setShowChatInterface(false)}
      />
    </div>
  );
}
