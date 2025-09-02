import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import ChatInterface from "@/components/support/chat-interface";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-accent text-accent-foreground p-3 rounded-full shadow-lg hover:bg-accent/90 transition-all hover:scale-105"
          size="icon"
          data-testid="floating-chat-button"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {isOpen && (
        <ChatInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
