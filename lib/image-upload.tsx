import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

export const getPhotoCount = async() => {

    const {userId} = auth();

    if(!userId) {
        return 0;
    }

    const limit = await prismadb.photos.findMany({
        where: {userId : userId},
    });

    if(!limit) {
        return 0;
    }

    return limit;
}