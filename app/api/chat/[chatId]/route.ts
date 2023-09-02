// Importing necessary libraries and modules
import { rateLimit } from "@/lib/rate-limit";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Companion } from '@prisma/client';
import prismadb from "@/lib/prismadb";  // Database client based on Prisma
import { MemoryManager } from "@/lib/memory";  // Memory management for chatbot
import { StreamingTextResponse, LangChainStream } from "ai";
import { Replicate } from "langchain/llms/replicate";  // Replicate model from langchain
import { CallbackManager } from "langchain/callbacks";  // Callback manager from langchain
import { checkSubscription } from "@/lib/subscription";  // Utility to check if a user has a pro subscription
import { incrementApiLimit } from "@/lib/api-limit";  // Utility to increment the API limit

// POST method to handle incoming chat requests
export async function POST(
  request: Request,  // Incoming request
  { params }: { params: { chatId: string } }  // URL parameters
) {
  try {
    // Extract the chat prompt from the incoming request
    const { prompt } = await request.json();
    // Fetch the current user details
    const user = await currentUser();

    // Check if the user has a pro subscription
    const isPro = await checkSubscription();

    // If user data is missing or incomplete, return an unauthorized response
    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Generate a unique identifier for rate limiting
    const identifier = request.url + "-" + user.id;

    // Check rate limits for the user
    const { success } = await rateLimit(identifier);

    // If rate limit exceeded, return a rate limit response
    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    // Update the companion's message in the database
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
    });

    // If the companion is not found in the database, return a 404 response
    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    // Generate constants and filenames for the Memory Manager
    const name = companion.id;
    const companion_file_name = name + ".txt";

    // Define the companion key for memory operations
    const companionKey = {
      companionName: name!,
      userId: user.id,
      modelName: "llama2-13b",
    };

    // Get the singleton instance of the Memory Manager
    const memoryManager = await MemoryManager.getInstance();

    // Fetch existing records (if any) for this companion from Redis
    const records = await memoryManager.readLatestHistory(companionKey);

    // If there are no previous records, seed the Memory Manager with example chat history
    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }

    // Write the current chat prompt to the vector store
    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    // Fetch the recent chat history for the companion
    const recentChatHistory = await memoryManager.readLatestHistory(companionKey);

    // Search for similar documents in the vector store based on the recent chat history
    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name
    );

    // Extract relevant chat history from the similar documents
    let relevantHistory = "";
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    // Initialize langchain handlers
    const { handlers } = LangChainStream();
    // Initialize the Replicate model for inference
    const model = new Replicate({
      model:
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    // Turn on verbose mode for debugging
    model.verbose = true;

    // Construct the input for the Replicate model and call it for inference
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

    // Clean and process the model response
    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0];

    // Write the model response to the Memory Manager
    await memoryManager.writeToHistory("" + response.trim(), companionKey);

    // Convert the response to a readable stream
    var Readable = require("stream").Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);

    // If the response is valid, update the chat history in the database
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

    // If the user is not a pro subscriber, increment the API usage limit
    if (!isPro) {
      await incrementApiLimit();
    }

    // Return the model response as a streaming response
    return new StreamingTextResponse(s);

  } catch (error) {  // Catch any errors and return a 500 Internal Server Error response
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
