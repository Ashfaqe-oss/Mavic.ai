import Replicate from "replicate";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    // const { userId } = auth();
    const user = await currentUser();
    const body = await req.json();
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrail && !isPro) {
      return new NextResponse(
        "Free Trail has ended. Please upgrade to go pro",
        { status: 402 }
      );
    }

    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed,
      },
    });

    return NextResponse.json(companion);
  } catch (err) {
    console.log("[COMPANION_ERROR]", err);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    console.log("Completed COMPANION Generation request");
  }
}
