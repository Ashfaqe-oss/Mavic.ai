"use client";
import * as z from "zod";

import axios from "axios";
import Heading from "@/components/heading";
import { Code, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  amountOptions,
  formSchema,
  modelOptions,
  resolutionOptions,
} from "./constants";
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
import Empty from "@/components/elements/empty";
import { UserAvatar } from "@/components/avatars/user-avatar";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/elements/loader";
import ReactMarkdown from "react-markdown";
import MusicPage from "../music/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";
import { setCookie, getCookie } from "cookies-next";
import { useUser } from "@clerk/nextjs";

const ImagePage = () => {
  const router = useRouter();

  const proModal = useProModal();

  const [images, setImages] = useState<string[]>([]);

  // useEffect(() => {
  //   setImages((current) => [
  //     ...current,
  //     "https://replicate.delivery/pbxt/2VMeFNjbLg0qYS7Blptlu7CEC2cckQqmVOfEiIpgUVlNEfziA/out-0.png",
  //     "https://replicate.delivery/pbxt/BfYZYDVgAS1BYavXwoLlJZeIuiF9jsk0tdbd6erWeJi5v9nFB/out-0.png",
  //     "https://pbxt.replicate.delivery/vVQsffF31Mlk1ktZNDeXF2sWiJuOkev9QSP6KxxwuZQN98nFB/out-0.png"
  //   ]);
  // }, []);

  const { user } = useUser();
  console.log(user);

  const cookieName = `imageURLs-${user?.id}`;

  useEffect(() => {
    // setCookie(cookieName, "https://replicate.delivery/pbxt/2VMeFNjbLg0qYS7Blptlu7CEC2cckQqmVOfEiIpgUVlNEfziA/out-0.png");

    const storedURLs = getCookie(cookieName);
    if (typeof storedURLs === "string") {
      try {
        const parsedData = JSON.parse(storedURLs);
        setImages(parsedData);
      } catch (error) {
        console.error("Error parsing cookie data:", error);
      }
    }
  }, [cookieName]); // Empty dependency array ensures this runs only once when the component mounts

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "256x256",
      model: "1",
    },
  });

  //use form has its own loading state

  const isLoading = form.formState.isSubmitting;
  console.log(images);

  const defaultImages = [
    "https://replicate.delivery/pbxt/BfYZYDVgAS1BYavXwoLlJZeIuiF9jsk0tdbd6erWeJi5v9nFB/out-0.png",
    "https://oaidalleapiprodscus.blob.core.windows.net/private/org-6J3GqinzRysugI68sdSkKdnW/user-YT1l2mTbxtkOpMHDZy0HsdQD/img-svsuOfCgRUnKjlBWWtGHNlYi.png?st=2023-08-14T15%3A37%3A13Z&se=2023-08-14T17%3A37%3A13Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-08-13T17%3A21%3A45Z&ske=2023-08-14T17%3A21%3A45Z&sks=b&skv=2021-08-06&sig=CpEnsYwkYIK9BSCRUQE1qMnY9WaBZ3khCCAgLVKCmKQ%3D",
  ];

  const combineUniqueImages = (
    newImages: string[],
    existingImages: string[],
    defaultImages: string[]
  ): string[] => {
    const combinedSet = new Set([
      ...newImages,
      ...existingImages,
      ...defaultImages,
    ]);
    return Array.from(combinedSet);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // setImages([]);
      console.log(data);

      if (data.model === "1") {
        const response = await axios.post("/api/image/dalle", data);
        const urls = response.data.map((image: { url: string }) => image.url);

        const combinedURLs = combineUniqueImages(urls, images, defaultImages);

        setImages(combinedURLs);
        setCookie(cookieName, JSON.stringify(combinedURLs));
        toast.success("Images generated successfully");
        form.reset();
      } else {
        const response = await axios.post("/api/image/stability", data);
        const url = response?.data[0];

        const combinedURLs = combineUniqueImages([url], images, defaultImages);

        setCookie(cookieName, JSON.stringify(combinedURLs));
        setImages(combinedURLs);
        toast.success("Images generated successfully");
      }

      // const urls = ["https://replicate.delivery/pbxt/vVQsffF31Mlk1ktZNDeXF2sWiJuOkev9QSP6KxxwuZQN98nFB/out-0.png", "https://replicate.delivery/pbxt/2VMeFNjbLg0qYS7Blptlu7CEC2cckQqmVOfEiIpgUVlNEfziA/out-0.png"]

      // setCookie(cookieName ,urls);
      // toast.success("cookies set")
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
        title="Image Generation"
        desc="Realistic Image generation capabilities here.."
        imgUrl="/photo.png"
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
                max-w-7xl
              "
            >
              <FormField
                name="prompt"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-5">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent bg-primary/10 pl-4 max-w-4xl"
                        disabled={isLoading}
                        placeholder="Realistic image of a cat"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Briefly describe of how you want your image to look like.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-2">
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {amountOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the no.of images to generate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resolution"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-2">
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resolutionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the resolution for your images
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-2">
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the model to generate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-1 w-full mt-2 lg:mt-0 px-2"
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
          {images?.length === 0 && !isLoading && (
            <Empty
              label="No images generated yet."
              label2="This is a stateless feature.. as it is still in Beta "
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
            {/* images map */}
            {images?.map((image) => (
              <Card key={image} className="rounded-lg overflow-hidden">
                <div className="aspect-square relative">
                  <Image fill alt="Image" src={image} />
                </div>
                <CardFooter className="p-2">
                  <Button
                    onClick={() => window.open(image)}
                    variant="secondary"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2">Download</Download>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePage;
