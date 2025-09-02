import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { websocketManager } from "@/lib/websocket";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X,
  Download,
  FileText,
  Clock,
  CheckCircle
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickQueries = [
  "How do I submit a leave request?",
  "What are my health benefits?", 
  "How to claim reimbursements?",
  "Policy on remote work?",
  "How to update my personal information?",
  "What's the vacation policy?",
];

const suggestedActions = [
  { text: "Download leave form", type: "download", icon: Download },
  { text: "View policy documents", type: "documents", icon: FileText },
  { text: "Contact HR directly", type: "escalate", icon: User },
];

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load previous chat messages
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/support/chat-messages'],
    queryFn: () => api.getChatMessages(),
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => api.askFAQ({ query: message, userId: 'current-user' }),
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Initialize with welcome message
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: "Hello! I'm your AI HR assistant. How can I help you today?",
          timestamp: new Date(),
        }
      ]);

      // Connect to WebSocket
      websocketManager.connect('current-user');

      // Handle WebSocket messages
      const handleWebSocketMessage = (data: any) => {
        if (data.type === 'chat_response') {
          // Remove typing indicator and add actual response
          setMessages(prev => {
            const filtered = prev.filter(m => !m.isTyping);
            return [
              ...filtered,
              {
                id: Date.now().toString(),
                type: 'assistant',
                content: data.content,
                timestamp: new Date(data.timestamp),
              }
            ];
          });
        }
      };

      websocketManager.onMessage('chat_response', handleWebSocketMessage);
      setIsConnected(true);

      return () => {
        websocketManager.offMessage('chat_response', handleWebSocketMessage);
      };
    } else {
      setMessages([]);
      setIsConnected(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Load chat history when available
    if (chatHistory && chatHistory.length > 0) {
      const historyMessages: Message[] = chatHistory.slice(-5).map((msg: any) => ([
        {
          id: `${msg.id}-user`,
          type: 'user' as const,
          content: msg.message,
          timestamp: new Date(msg.createdAt),
        },
        ...(msg.response ? [{
          id: `${msg.id}-assistant`,
          type: 'assistant' as const,
          content: msg.response,
          timestamp: new Date(msg.createdAt),
        }] : [])
      ])).flat();

      if (historyMessages.length > 0) {
        setMessages(prev => [
          {
            id: 'welcome',
            type: 'assistant',
            content: "Welcome back! Here's our recent conversation. How can I help you today?",
            timestamp: new Date(),
          },
          ...historyMessages,
        ]);
      }
    }
  }, [chatHistory]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'assistant',
      content: 'AI is typing...',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, typingMessage]);

    if (isConnected) {
      // Send via WebSocket for real-time response
      websocketManager.sendMessage('chat', {
        content: content.trim(),
        userId: 'current-user',
      });
    } else {
      // Fallback to HTTP API
      try {
        const response = await sendMessageMutation.mutateAsync(content.trim());
        
        // Remove typing indicator and add response
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isTyping);
          return [
            ...filtered,
            {
              id: Date.now().toString(),
              type: 'assistant',
              content: response.response,
              timestamp: new Date(),
            }
          ];
        });
      } catch (error) {
        // Remove typing indicator on error
        setMessages(prev => prev.filter(m => !m.isTyping));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleQuickQuery = (query: string) => {
    sendMessage(query);
  };

  const handleSuggestedAction = (action: any) => {
    switch (action.type) {
      case 'download':
        toast({
          title: "Download Started",
          description: "Form download would be initiated here.",
        });
        break;
      case 'documents':
        toast({
          title: "Documents",
          description: "Redirecting to document library.",
        });
        break;
      case 'escalate':
        toast({
          title: "Escalated",
          description: "Your query has been forwarded to HR team.",
        });
        break;
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <DialogTitle>HR Support Chat</DialogTitle>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent animate-pulse' : 'bg-muted'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? 'AI Assistant Online' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-chat">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-96">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 py-2">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      {message.isTyping ? (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-accent-foreground rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-accent-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-accent-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      ) : (
                        <Bot className="w-3 h-3 text-accent-foreground" />
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-xs rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.isTyping
                      ? 'bg-muted/50 text-muted-foreground'
                      : 'bg-muted/50 text-foreground'
                  }`}>
                    <p className="text-sm" data-testid={`message-${message.id}`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Queries */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickQueries.slice(0, 3).map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1 px-2"
                    onClick={() => handleQuickQuery(query)}
                    data-testid={`quick-query-${index}`}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Actions */}
          {messages.length > 2 && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Suggested actions:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1 px-2"
                      onClick={() => handleSuggestedAction(action)}
                      data-testid={`suggested-action-${index}`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {action.text}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 text-sm"
                disabled={sendMessageMutation.isPending}
                data-testid="chat-input"
              />
              <Button
                size="sm"
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || sendMessageMutation.isPending}
                data-testid="send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
