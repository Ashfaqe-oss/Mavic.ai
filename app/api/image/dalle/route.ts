import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const instructMessage: ChatCompletionRequestMessage = {
    role: "system",
    content: "You are an Expert code generator. You must answer only in markdown code snippets. Use code comments for explanations. You will ask the user which language to generate the code in, if not provided already. You will refrain from answering questions that are not related to code / coding."
}

export async function POST(req: Request) {

    try {
        const {userId} = auth();
        const body = await req.json();
        const {prompt, amount = 1, resolution = "512x512" } = body; // destructuring body's message

        if(!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        if(!configuration.apiKey) {
            return new NextResponse("OpenAI API key not setup", {status: 500})
        }

        if(!prompt) {
            return new NextResponse("No prompt provided", {status: 400})
        }
        if(!amount) {
            return new NextResponse("No amount provided", {status: 400})
        }
        if(!resolution) {
            return new NextResponse("No resolution provided", {status: 400})
        }

        const freeTrial = await checkApiLimit();
        const isPro = await checkSubscription();

        if(!freeTrial && !isPro) {
            return new NextResponse("You have exceeded your API limit. Please upgrade your plan.", {status: 402})
        }

        const response = await openai.createImage({
            prompt: prompt,
            n: parseInt(amount, 10),
            size: resolution,
        })

        if(!isPro) {
            await incrementApiLimit();
        }

        return NextResponse.json(response.data.data);

    } catch (error) {
        console.log('[DALLE_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    } finally {
        console.log("Completed DALLE Image generation request")
    }
}