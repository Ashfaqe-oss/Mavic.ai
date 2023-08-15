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

    await prismadb.musics.create({
      data: {
        userId,
        src: url,
      },
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.log("[music_PUBLISH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    console.log("Completed music publishing request");
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

    // Retrieve the Musics associated with the user from the database
    const userMusics = await prismadb.musics.findMany({
      where: {
        userId: userId,
      },
      select: {
        src: true,
      },
    });

    // Extracting the URLs from the userMusics array
    const musicUrls = userMusics.map((music) => music.src);

    return NextResponse.json({ musics: musicUrls });
  } catch (error) {
    console.log("[music_RETRIEVAL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    console.log("Completed music retrieval request");
  }
}
