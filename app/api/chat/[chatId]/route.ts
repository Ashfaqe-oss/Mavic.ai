import { rateLimit } from "@/lib/rate-limit";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Companion } from '@prisma/client';
import prismadb from "@/lib/prismadb";
import { MemoryManager } from "@/lib/memory";
import { StreamingTextResponse, LangChainStream } from "ai";
import { Replicate } from "langchain/llms/replicate";
import { CallbackManager } from "langchain/callbacks";
import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit } from "@/lib/api-limit";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    
    const isPro = await checkSubscription();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id; // to block one particular user

    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const companion = await prismadb.companion.update({
        where: {
            id: params.chatId
        },
        data: {
            messages: {
              create: {
                content: prompt,
                role: "user",
                userId: user.id,
              },
            },
          }
    })

    if (!companion) {
        return new NextResponse("Companion not found", { status: 404 });
    }

    //  generate constants and filenames for memory manager
    
    const name = companion.id;
    const companion_file_name = name + ".txt";

    const companionKey = {
        companionName: name!,
        userId: user.id,
        modelName: "llama2-13b",
    };
    
    const memoryManager = await MemoryManager.getInstance();

    //go n read if any memory for this companion already exists
    const records = await memoryManager.readLatestHistory(companionKey);

    // if no records we have to seed the memory manager with example conversation chat history
    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey); /// adds line by line
    }

    // write to vector store
    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    // Query Pinecone

    const recentChatHistory = await memoryManager.readLatestHistory(companionKey);

    // Right now the preamble is included in the similarity search, but that
    // shouldn't be an issue

    const similarDocs = await memoryManager.vectorSearch(
        recentChatHistory,
        companion_file_name
    );

    let relevantHistory = "";
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    //langchain handlers

    const { handlers } = LangChainStream();
    // Call Replicate for inference
    const model = new Replicate({
      model:
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    
    // Turn verbose on for debugging
    model.verbose = true;

    const resp = String(
      await model
        .call(
          `
        ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix. 

        ${companion.instructions}

        Below are relevant details about ${companion.name}'s past and the conversation you are in.
        ${relevantHistory}


        ${recentChatHistory}\n${companion.name}:`
        )
        .catch(console.error)
    );

    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0];

    await memoryManager.writeToHistory("" + response.trim(), companionKey);
    
    //readale stream
    var Readable = require("stream").Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);
    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory("" + response.trim(), companionKey);

      await prismadb.companion.update({
        where: {
          id: params.chatId
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        }
      });
    }

    if(!isPro) {
        await incrementApiLimit();
    }
    
    return new StreamingTextResponse(s);

  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
