import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";
import React, { ChangeEvent, FormEvent } from "react";
import { ChatRequestOptions } from "ai";

interface ChatFormProps {
  input: string;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined
  ) => void;
  isLoading: boolean;
}

export default function ChatForm({
  input,
  handleInputChange,
  onSubmit,
  isLoading,
}: ChatFormProps) {
  return (
    <form onSubmit={onSubmit} className="pt-2 pb-4 flex items-center gap-x-2">
      <Input
        disabled={isLoading}
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message"
        className="rounded-lg bg-primary/10"
      />
      <Button disabled={isLoading} variant="ghost">
        <SendHorizonal className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    </form>
  );
}
