
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function POST(req: Request) {

    try {
        const {userId} = auth();
        const body = await req.json();
        const {user_id, urls} = body; // destructuring body's message

        if(!userId || !user_id || userId !== user_id) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        if(!urls) {
            return new NextResponse("No messages provided", {status: 400})
        }

        for(const url of urls) {
            await prismadb.photos.create({
                data: {
                    userId, src: url
                }
            })
        }

        return NextResponse.json({message: "Success"});

    } catch (error) {
        console.log('[IMAGE_PUBLISH_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    } finally {
        console.log("Completed image publishing request");
        // router.refresh();
    }
}



export async function GET() {
    try {
        const { userId } = auth();

        // const body = await req.json();
        // const {user_id} = body; 

        if(!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        // Retrieve the images associated with the user from the database
        const userImages = await prismadb.photos.findMany({
            where: {
                userId: userId
            },
            select: {
                src: true
            }
        });

        // Extracting the URLs from the userImages array
        const imageUrls = userImages.map(image => image.src);

        return NextResponse.json({ images: imageUrls });

    } catch (error) {
        console.log('[IMAGE_RETRIEVAL_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    } finally {
        console.log("Completed Image retrieval request");
    }
}
