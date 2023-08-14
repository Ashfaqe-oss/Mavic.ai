import { UserApiLimit } from './../node_modules/.prisma/client/index.d';
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { MAX_FREE_COUNTS } from "@/constants";

export const incrementApiLimit = async () => {
    const {userId} = auth();

    if(!userId) {
        return;
    }

    const limit = await prismadb.userApiLimit.findUnique({
        where: {userId : userId}
    });


    if(limit) {
        await prismadb.userApiLimit.update({
            where: {userId: userId},
            data: { count : limit.count + 1},
        })
    } else {
        await prismadb.userApiLimit.create({
            data: { userId : userId, count: 1}
        })
    }
}

export const checkApiLimit = async() => {
    const {userId} = auth();

    if(!userId) {
        return false;
    }

    const limit = await prismadb.userApiLimit.findUnique({
        where: {userId : userId},
    })

    if(!limit || limit.count < MAX_FREE_COUNTS) {
        return true;
    } else {
        false;
    }
}


export const getApiLimit = async() => {

    const {userId} = auth();

    if(!userId) {
        return 0;
    }

    const limit = await prismadb.userApiLimit.findUnique({
        where: {userId : userId},
    });

    if(!limit) {
        return 0;
    }

    return limit.count;
}