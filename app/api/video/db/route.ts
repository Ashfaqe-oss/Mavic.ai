import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { url } = body; // destructuring body's message

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!url) {
      return new NextResponse("No messages provided", { status: 400 });
    }

    await prismadb.videos.create({
      data: {
        userId,
        src: url,
      },
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.log("[video_PUBLISH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    console.log("Completed video publishing request");
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

    // Retrieve the videos associated with the user from the database
    const userVideos = await prismadb.videos.findMany({
      where: {
        userId: userId,
      },
      select: {
        src: true,
      },
    });

    // Extracting the URLs from the uservideos array
    const videoUrls = userVideos.map((video) => video.src);

    return NextResponse.json({ videos: videoUrls });
  } catch (error) {
    console.log("[video_RETRIEVAL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    console.log("Completed video retrieval request");
  }
}
