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
    const { prompt, amount, resolution } = body;
    const [width, height] = resolution.split('x');

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrail && !isPro) {
      return new NextResponse(
        "Free Trail has ended. Please upgrade to go pro",
        { status: 402 }
      );
    }

    const response = await replicate.run(
      "stability-ai/sdxl:a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5",
      {
        input: {
          prompt: prompt,
        //   width: width,
        //   height: height,
        //   num_outputs: amount
        },
      }
    );

    if(!isPro) {
        await incrementApiLimit()
    }

    return NextResponse.json(response);
  } catch (err) {
    console.log('[STABILITY_ERROR]', err);
    return new NextResponse("Internal Error", {status: 500});
  } finally {
    console.log("Completed STABILITY Image Generation request")
  }
}
