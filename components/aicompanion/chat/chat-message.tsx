import { BotAvatar } from "@/components/avatars/bot-avatar";
import { ChatBotAvatar } from "@/components/avatars/chat-bot-avatar";
import { UserAvatar } from "@/components/avatars/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

export interface ChatMessageProps {
  role: "system" | "user",
  content?: string;
  isLoading?: boolean;
  src?: string;
}

export default function ChatMessage({
  role,
  content,
  isLoading,
  src
}: ChatMessageProps) {

  const { theme } = useTheme();

  const onCopy = () => {
    if(!content) return;

    navigator.clipboard.writeText(content);
    toast.success('Successfully copied content', {
      position: "bottom-center"
    })
  }

  return (
    <div className={cn(
      "group flex items-start gap-x-3 py-4 w-full",
      role === "user" && "justify-end"
    )}>
      {role !== "user" && src && <ChatBotAvatar src={src} />}
      {role === "user" && !isLoading && (
        <Button 
          onClick={onCopy} 
          className="opacity-0 group-hover:opacity-100 transition" 
          size="icon"
          variant="ghost"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}
      <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
        {isLoading 
          ? <BeatLoader color={theme === "light" ? "black" : "white"} size={5} /> 
          : content
        }
      </div>
      {role === "user" && <UserAvatar />}
      {role !== "user" && !isLoading && (
        <Button 
          onClick={onCopy} 
          className="opacity-0 group-hover:opacity-100 transition" 
          size="icon"
          variant="ghost"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
