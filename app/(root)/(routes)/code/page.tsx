"use client";
import * as z from "zod";

import axios from "axios";
import Heading from "@/components/heading";
import { Code, Copy } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./constants";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import Empty from "@/components/elements/empty";
import { UserAvatar } from "@/components/avatars/user-avatar";
// import { BotAvatar } from "@/components/bot-avatar";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/elements/loader";
import ReactMarkdown from "react-markdown";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";
import { BotAvatar } from "@/components/avatars/bot-avatar";
import { getCookie, setCookie } from "cookies-next";
import { useUser } from "@clerk/nextjs";

const CodePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const { user } = useUser();
  console.log(user?.id)

  const cookieName = `codeMessages-${user?.id}`;


  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const storedMessages = getCookie(cookieName);
    if (storedMessages && typeof storedMessages === "string") {
      setMessages(JSON.parse(storedMessages));
    }
    setIsLoaded(true);
  }, [cookieName]);

  const router = useRouter();

  const proModal = useProModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  //use form has its own loading state

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // throw new Error("hio")
      console.log(messages);

      const userMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: data.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/code", { messages: newMessages });
      // setMessages((current) => [...current, userMessage, response.data]);

      const newMessagesList = [...messages, userMessage, response.data];
      setMessages(newMessagesList);
      setCookie(cookieName, JSON.stringify(newMessagesList));

      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 402) {
        toast.error(
          "You have used up your Mavic free limit. Pls upgrade to continue"
        );
        proModal.onOpen();
      } else {
        console.log(error);
        toast.error("Something went wrong.", error);
      }
    } finally {
      router.refresh();
      form.reset();
    }
  };

  const onCopy = ({ content }: any) => {
    console.log(content)

    if (!content) return;

    navigator.clipboard.writeText(content);
    toast.success("Successfully copied content", {
      position: "bottom-center",
    });
  };

  if (!isLoaded) {
    return <Loader txt={"Loading your previous chat"} />;
  }

  return (
    <div>
      <Heading
        title="Code Generation"
        desc="Advanced code generation capabilities here.."
        icon={Code}
        imgUrl="/transcript.png"
      />

      <div className="px-4 lg:px-8">
        <div>
          {/* shadcn form component use */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="
                rounded-lg 
                border 
                w-full 
                p-4 
                px-3 
                mb-8
                md:px-6 
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2
                m-auto
                max-w-5xl
              "
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent bg-primary/10 pl-4 max-w-4xl"
                        disabled={isLoading}
                        placeholder="Give code to solve merge Intervals leetcode problem."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full mt-2 lg:mt-0"
                type="submit"
                disabled={isLoading}
                size="icon"
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>

        <div
          className="space-y-4 mt-4 
                m-auto
                max-w-5xl"
        >
          {/* Message content */}
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-secondary">
              <Loader txt={"mavic is on work..."} />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty
              label="No conversation started..."
              label2="This is a stateless chat as it is still in Beta - your chats will disappear once browser is closed"
            />
          )}
          <div>
            {messages.map((message) => (
              <div
                key={message.content}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg group",
                  message.role === "user"
                    ? "bg-primary/10 border border-black/10"
                    : "bg-muted"
                )}
              >
                <div className="hidden sm:block">
                  {message.role !== "user" && <BotAvatar />}
                </div>

                <ReactMarkdown
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-white/10 rounded-lg p-1" {...props} />
                    ),
                  }}
                  className="prose prose-sm overflow-hidden leading-7"
                >
                  {message.content || ""}
                </ReactMarkdown>
                <div className="hidden sm:block">
                  {message.role === "user" && <UserAvatar />}
                </div>
                {!isLoading && (
                  <Button
                    onClick={() => onCopy(message)}
                    className="opacity-0 group-hover:opacity-100 transition"
                    size="icon"
                    variant="ghost"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePage;
