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
    const { prompt } = body;

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
        "anotherjesse/zeroscope-v2-xl:71996d331e8ede8ef7bd76eba9fae076d31792e4ddf4ad057779b443d6aea62f",
        {
          input: {
            prompt,
            negative_propmt: "very blue, dust, noisy, washed out, ugly, distorted, broken"
          }
        }
    );
    if(!isPro) {
        await incrementApiLimit()
    }

    return NextResponse.json(response);
  } catch (err) {
    console.log('[VIDEO_ERROR]', err);
    return new NextResponse("Internal Error", {status: 500});
  } finally {
    console.log("Completed VIDEO Generation request")
  }
}
