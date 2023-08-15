"use client";
import * as z from "zod";

import axios from "axios";
import Heading from "@/components/heading";
import { Code, Download } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
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
import { Card, CardFooter } from "@/components/ui/card";

const VideoPage = () => {
  const [videos, setVideos] = useState<string[]>([]);
  const { user } = useUser();
  const router = useRouter();
  const proModal = useProModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  const isLoading = form.formState.isSubmitting;

  const defaultVideos = useMemo(
    () => [
      // Add your default video URLs here if you have any
      "https://pbxt.replicate.delivery/F8m7Kop7VKItPd6e0NeiZPCeF4A3obyjORpZ5KzbVzLbWi0iA/output-0.mp4",
      "https://replicate.delivery/pbxt/mxkex5K3JZUKPKlni9KjpKKOY9v1sNKxechcErwtkVOxfi0iA/output-0.mp4",
      "https://pbxt.replicate.delivery/l8iVjqoRMlqNAFax1GOiouailR5ohit6DEiVrT9wFTFemItIA/output-0.mp4",
    ],
    []
  );

  const combineUniqueVideos = (...videoArrays: string[][]) => {
    const combinedSet = new Set<string>();
    videoArrays.forEach((array = []) => { // Providing a default value here
      array.forEach((video) => {
        combinedSet.add(video);
      });
    });
    return Array.from(combinedSet);
  };

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get(`/api/video/db`);
       
        if (response.data && Array.isArray(response.data.videos)) {
          const combinedVideos = combineUniqueVideos(
            response.data.videos || [], // Providing a default value here
            defaultVideos
          );
          setVideos(combinedVideos);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    }

    if (user?.id) {
      fetchVideos();
    }
  }, [user?.id, defaultVideos]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log(videos);

      const response = await axios.post("/api/video", data);
      const newVideo = response?.data[0];

      await axios.post("/api/video/db", {
        url: newVideo,
      });

      setVideos((prev) => [newVideo, ...prev]);

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
                      Briefly describe of how and what you want your video to
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

          {!videos && !isLoading && (
            <Empty
              label="No video generated."
              label2="This is a stateless feature.. as it is still in Beta "
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {/* video here  */}
            {videos &&
              videos.map((videoUrl, idx) => (
                <Card key={idx} >
                  <div className="aspect-square relative">
                    <video controls className="w-full mt-8">
                      <source src={videoUrl} />
                    </video>
                  </div>
                  {/* <CardFooter className="p-2">
                    <Button
                      onClick={() => window.open(videoUrl)}
                      variant="secondary"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2">Download</Download>
                    </Button>
                  </CardFooter> */}
                </Card>
              ))}
          </div>
        </div>

        <div className="m-auto my-4 mx-2 py-6 flex items-center">
          <p className="m-auto mt-2 text-sm text-muted-foreground">
            {" "}
            Some Previously Generated examples{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
