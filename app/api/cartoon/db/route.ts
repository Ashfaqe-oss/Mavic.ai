import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { user_id, url } = body; // destructuring body's message

    if (!userId || !user_id || userId !== user_id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!url) {
      return new NextResponse("No messages provided", { status: 400 });
    }

    await prismadb.cartoons.create({
      data: {
        userId,
        src: url,
      },
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.log("[cartoon_PUBLISH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    console.log("Completed cartoon publishing request");
    // router.refresh();
  }
}

export async function GET() {
  try {
    const { userId } = auth();

    // const body = await req.json();
    // const {user_id} = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Retrieve the Cartoons associated with the user from the database
    const userCartoons = await prismadb.photos.findMany({
      where: {
        userId: userId,
      },
      select: {
        src: true,
      },
    });

    // Extracting the URLs from the userCartoons array
    const cartoonUrls = userCartoons.map((cartoon) => cartoon.src);

    return NextResponse.json({ cartoons: cartoonUrls });
  } catch (error) {
    console.log("[cartoon_RETRIEVAL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    console.log("Completed cartoon retrieval request");
  }
}
