import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt must be at least 1 character long",
  }),

  amount: z.string().min(1),
  resolution: z.string().min(1),
  model: z.string().min(1, { message: "Select any model" }),
});

export const amountOptions = [
  {
    value: "1",
    label: "1 Photo",
  },
  {
    value: "2",
    label: "2 Photos",
  },
  {
    value: "3",
    label: "3 Photos",
  },
  {
    value: "4",
    label: "4 Photos",
  },
];

export const modelOptions = [
  {
    value: "1",
    label: "Dall-e",
  },
  {
    value: "2",
    label: "Stability AI",
  },
];

export const resolutionOptions = [
  {
    value: "256x256",
    label: "256x256",
  },
  {
    value: "512x512",
    label: "512x512",
  },
  // {
  //   value: "1024x1024",
  //   label: "1024x1024",
  // },
];
