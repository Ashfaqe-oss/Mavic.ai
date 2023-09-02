// Import required dependencies for Redis, OpenAI embeddings, and Pinecone
import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

// Define a custom type 'CompanionKey' to represent unique identifiers for a chatbot companion
export type CompanionKey = {
  companionName: string;  // Name of the companion/chatbot
  modelName: string;      // Model name used by the companion
  userId: string;         // Unique user ID interacting with the companion
};

// Class 'MemoryManager' is responsible for managing memory, especially the chat history and vector searches
export class MemoryManager {
  // Static instance for the Singleton pattern (ensures only one instance of MemoryManager is created)
  private static instance: MemoryManager;
  
  // Redis instance to manage chat history
  private history: Redis;
  
  // Pinecone database client to manage vector-based operations
  private vectorDBClient: PineconeClient;

  // Constructor initializes Redis and Pinecone clients
  public constructor() {
    // Instantiate Redis client using environment variables
    this.history = Redis.fromEnv();
    
    // Instantiate Pinecone database client
    this.vectorDBClient = new PineconeClient();
  }

  // Method to initialize the Pinecone client with the necessary API key and environment details
  public async init() {
    if (this.vectorDBClient instanceof PineconeClient) {
      await this.vectorDBClient.init({
        apiKey: process.env.PINECONE_API_KEY!,          // Use Pinecone API key from environment variables
        environment: process.env.PINECONE_ENVIRONMENT!, // Use Pinecone environment details from environment variables
      });
    }
  }

  // Method to perform a vector search based on recent chat history to retrieve similar documents
  public async vectorSearch(
    recentChatHistory: string,       // Recent chat history as input
    companionFileName: string        // File name associated with the chatbot companion
  ) {
    // Typecasting vectorDBClient to PineconeClient
    const pineconeClient = <PineconeClient>this.vectorDBClient;
    
    // Fetch Pinecone index using environment variable or default to an empty string
    const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX! || "");
    
    // Create or fetch an existing vector store using OpenAI embeddings and the Pinecone index
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }), // Use OpenAI API key from environment variables
      { pineconeIndex }
    ); 

    // Perform a similarity search in the vector store with the given chat history, limit results to 3, and filter by filename
    // Catch and log any errors that may occur during the search
    const similarDocs = await vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
      .catch((err) => {
        console.log("WARNING: failed to get vector search results.", err);
      });

    // Return the results from the similarity search
    return similarDocs;
  }

  // Singleton pattern: Returns the single instance of MemoryManager, creating it if it doesn't already exist
  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();  // Create a new instance if one doesn't exist
      await MemoryManager.instance.init();            // Initialize the new instance
    }
    return MemoryManager.instance;
  }

  // Method to generate a unique Redis key based on the CompanionKey details
  private generateRedisCompanionKey(companionKey: CompanionKey): string {
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }

  // Method to write a chat message to the Redis chat history
  public async writeToHistory(text: string, companionKey: CompanionKey) {
    // Check for invalid companionKey or missing userId
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrectly");
      return "";
    }

    // Generate a Redis key using the companionKey details
    const key = this.generateRedisCompanionKey(companionKey);

    // Add the chat message to Redis with the current timestamp as the score
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  // Method to retrieve the latest chat history from Redis
  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    // Check for invalid companionKey or missing userId
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrectly");
      return "";
    }

    // Generate a Redis key using the companionKey details
    const key = this.generateRedisCompanionKey(companionKey);

    // Fetch chat messages from Redis sorted by timestamp
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    // Take the last 30 chat messages, reverse their order, and join them with line breaks
    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join("\n");

    return recentChats;
  }

  // Method to seed initial chat history into Redis from a given content
  public async seedChatHistory(
    seedContent: String,             // Content used to seed the chat history
    delimiter: string = "\n",        // Delimiter used to split the seed content (defaults to a newline)
    companionKey: CompanionKey       // Details of the companion for whom the history is being seeded
  ) {
    // Generate a Redis key using the companionKey details
    const key = this.generateRedisCompanionKey(companionKey);

    // Check if the user already has a chat history in Redis
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }

    // Split the seed content by the given delimiter
    const content = seedContent.split(delimiter);

    let counter = 0;

    // Add each line from the seed content to Redis with a sequential score
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}
