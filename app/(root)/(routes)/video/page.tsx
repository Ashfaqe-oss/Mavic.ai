"use client";
import * as z from "zod";

import axios from "axios";
import Heading from "@/components/heading";
import { Code } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./constants";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import Empty from "@/components/elements/empty";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/elements/loader";
import ReactMarkdown from "react-markdown";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { getCookie, setCookie } from "cookies-next";

const VideoPage = () => {
  const [video, setVideo] = useState<string>();

  const router = useRouter();
  const proModal = useProModal();

  const { user } = useUser();

  const cookieName = `storedVideoURL-${user?.id}`;

  useEffect(() => {
    const storedVideoURL = getCookie(cookieName);
    if (typeof storedVideoURL === "string" && !storedVideoURL) {
      setVideo(storedVideoURL);
    }
}, [cookieName]);

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
      console.log(video);

      setVideo(undefined);

      const response = await axios.post("/api/video", data);

      setVideo(response.data[0]);

      setCookie(cookieName, response.data[0]);
      toast.success("Video generated successfully");

      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 402) {
        toast.error(
          "You have used up your Mavic free limit. Pls upgrade to continue"
        );
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
      form.reset();
    }
  };

  return (
    <div>
      <Heading
        title="Video Generation"
        desc="Advanced Video generation capabilities here.."
        imgUrl="/home.png"
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
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent bg-primary/10 pl-4 max-w-4xl"
                        disabled={isLoading}
                        placeholder="Girl dancing on a bridge."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Briefly describe of how and what you want your music to
                      be/have
                    </FormDescription>
                    <FormMessage />
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
              <Loader
                txt={"Cold starts can take upto 2 mins.. Pls come back later"}
              />
            </div>
          )}
          {!video && !isLoading && (
            <Empty
              label="No video generated."
              label2="This is a stateless feature.. as it is still in Beta "
            />
          )}
          <div>
            {/* video here  */}
            {video && (
              <video
                controls
                className="w-full aspect-video bg-black rounded-ld border mt-8"
              >
                <source src={video} />
              </video>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
