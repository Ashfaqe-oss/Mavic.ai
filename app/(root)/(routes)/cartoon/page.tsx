"use client";
import * as z from "zod";

import axios from "axios";
import Heading from "@/components/heading";
import { Code, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./constants";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import Empty from "@/components/elements/empty";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/elements/loader";
import { toast } from "react-hot-toast";
import Image from "next/image";

// You need to import our styles for the button to look right. Best to import in the root /layout.tsx but this is fine
import "@uploadthing/react/styles.css";
import { UploadButton, UploadDropzone } from "@/utils/uploadthing";
import { Card, CardFooter } from "@/components/ui/card";
import { useProModal } from "@/hooks/use-pro-modal";
import { useUser } from "@clerk/nextjs";
import { getCookie, setCookie } from "cookies-next";

const CartoonPage = () => {
  const [cartoon, setCartoon] = useState("https://pbxt.replicate.delivery/e4M7lfSUAAi4iUNnF6M6MbJeqBYZbYf5BvXn2oOWT4K3NQmFB/0-61341-remb.png");
  const [image, setImage] = useState("");
  const router = useRouter();
  
  const proModal = useProModal();

  
  const { user } = useUser();

  const cookieName = `cartoonURL-${user?.id}`;

  useEffect(() => {
    const storedCartoonURL = getCookie(cookieName);
    if (typeof storedCartoonURL === "string") {
      setImage(storedCartoonURL);
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
  console.log(cartoon)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        image: image,
        ...data,
      };

      const response = await axios.post("/api/cartoon", payload);
      // console.log(response);
      setCartoon(response.data[0]);
      
      setCookie(cookieName, JSON.stringify(response.data[0]));
      
      toast.success("Cartoon generated successfully")

      form.reset();
    } catch (error:any) {
      if (error?.response?.status === 402) {
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
        title="Cartoon Generation (Beta)"
        desc="Generation cartoons from your sketch.."
        imgUrl="/empty2.png"
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
                flex
                flex-col
                m-auto
                max-w-5xl
              "
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent bg-primary/10 pl-4"
                        disabled={isLoading}
                        placeholder="Give two word prompts only -- duck head, dinosaur leg, tiger claw, bird leg, tentacle arm, dragon body"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className=" mb-4 w-full">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res: any) => {
                    // Do something with the response
                    console.log("Files: ", res);
                    setImage(res[0].url);
                    alert("Upload Completed");
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    alert(`ERROR! ${error.message}`);
                  }}
                />
              </div>

              <Button
                className="col-span-6 lg:col-span-2 w-[112px] m-auto mt-4 px-4 lg:mt-0"
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
              <Loader txt={"Cold starts can take upto 2 mins.. Pls come back later"}/>
            </div>
          )}
          {cartoon.length == 0 && !isLoading && <Empty label="No cartoon generated." />}
          {cartoon.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">

              <Card className="rounded-lg overflow-hidden">
                <div className="relative aspect-square">
                  <Image fill alt="Generated" src={cartoon} />
                </div>
                <CardFooter className="p-2">
                  <Button
                    onClick={() => window.open(cartoon)}
                    variant="secondary"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartoonPage;
