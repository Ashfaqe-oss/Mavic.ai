"use client";
import * as z from "zod";

import axios from "axios";
import Heading from "@/components/heading";
import { Code } from "lucide-react";
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
import { setCookie, getCookie } from "cookies-next";
import { useUser } from "@clerk/nextjs";

const MusicPage = () => {
  const [musics, setMusics] = useState<string[]>([]);
  const { user } = useUser();
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

  const defaultMusics = useMemo(() => [
    // You can add your default music URLs here
    "https://pbxt.replicate.delivery/ffB96h9cflFzrIlUhgQLgP9pUVvVY0ns98hiJPSzfMUyuCpFB/gen_sound.wav",
    "https://pbxt.replicate.delivery/d1HQA2VIT1JUF5AbvnKKPm2AuaUreK0fkML0XpmIcPV1xQaRA/gen_sound.wav"
  ], []);

  const combineUniqueMusics = (...musicArrays: string[][]) => {
    const combinedSet = new Set<string>();
    musicArrays.forEach((array) => {
      array.forEach((music) => {
        combinedSet.add(music);
      });
    });
    return Array.from(combinedSet);
  };

  useEffect(() => {
    async function fetchMusics() {
      try {
        const response = await axios.get(`/api/music/db`);
        // console.log(response)
        if (response.data && Array.isArray(response.data.musics)) {
          // setMusics(prev => [...new Set([...prev, ...response.data.musics, ...defaultMusics])]);
          const combinedMusics = combineUniqueMusics(
            response.data.musics,
            defaultMusics
          );
          setMusics(combinedMusics);
        }
      } catch (error) {
        console.error("Failed to fetch musics:", error);
      }
    }

    if (user?.id) {
      fetchMusics();
    }
  }, [user?.id, defaultMusics]);

  // console.log(musics)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // console.log(musics);

      const response = await axios.post("/api/music", data);
      // console.log(response)

      const newMusic = response?.data.audio;

      // console.log(newMusic)

      // Save the music URL to the database
      await axios.post("/api/music/db", {
        url: newMusic
      });

      setMusics(prev => [newMusic, ...prev]);
      toast.success("Music generated successfully");
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 402) {
        proModal.onOpen();
        toast.error(
          "You have used up your Mavic free limit. Pls upgrade to continue"
        );
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      // router.refresh();
      form.reset();
    }
  };

  return (
    <div>
      <Heading
        title="Music Generation"
        desc="Advanced Music generation capabilities here.."
        imgUrl="/voice.png"
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
                        placeholder="Give music to sooth my cat."
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
          {!musics && !isLoading && (
            <Empty
              label="No Music generated."
              label2="This is a stateless feature.. as it is still in Beta "
            />
          )}
          <div>
            {/* Music here  */}
            {musics &&
              musics.map((musicUrl, idx) => (
                <audio key={idx} controls className="w-full mt-8">
                  <source src={musicUrl} />
                </audio>
              ))}
          </div>
        </div>

        <div className="m-auto my-4 mx-2 py-6 flex items-center">
          <p className="m-auto mt-2 text-sm text-muted-foreground"> Some Previously Generated examples </p>
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
