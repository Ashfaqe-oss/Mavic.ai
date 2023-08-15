import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

// export const runtime = 'edge';

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
        const {messages} = body; // destructuring body's message

        if(!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        if(!configuration.apiKey) {
            return new NextResponse("OpenAI API key not setup", {status: 500})
        }

        if(!messages) {
            return new NextResponse("No messages provided", {status: 400})
        }

        const freeTrial = await checkApiLimit();
        const isPro = await checkSubscription();

        if(!freeTrial && !isPro) {
            return new NextResponse("You have exceeded your API limit. Please upgrade your plan.", {status: 402})
        }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [instructMessage, ...messages]
        })

        if(!isPro) {
            await incrementApiLimit();
        }

        return NextResponse.json(response.data.choices[0].message);

    } catch (error) {
        console.log('[CODE_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    } finally {
        console.log("Completed Code answering request");
        // router.refresh();
    }
}