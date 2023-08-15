import Replicate from "replicate";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { image, prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrail =  await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrail && !isPro) {
      return new NextResponse(
        "Free Trail has ended. Please upgrade to go pro",
        { status: 402 }
      );
    }

    const response = await replicate.run(
      "deutschla/character-generator:602288aab4a00324ecd0a26fd1d360f70823e4e90a55e72c06b34f460b97a274",
      {
        input: {
          image: image,
          prompt: prompt
        }
      }
    );
    if(!isPro) {
        await incrementApiLimit()
    }
    // console.log(response)

    return NextResponse.json(response);
  } catch (err) {
    console.log('[CARTOON_ERROR]', err);
    return new NextResponse("Internal Error", {status: 500});
  } finally {
    console.log("Completed Cartoon Generation request")
  }
}
