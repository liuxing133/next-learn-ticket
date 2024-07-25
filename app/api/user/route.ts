import { PrismaClient } from '@prisma/client';  
import { NextRequest, NextResponse } from "next/server";

interface UserReqest {
    userId: string
}

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json() as UserReqest;

        if (!userId) {
            return NextResponse.json({
                message: "Bad Request"
            }, {
                status: 400
            })
        }

        let user = await prisma.user.findUnique({
            where: {
                userId: userId
            }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    userId: userId
                }
            })
        }
        return NextResponse.json({
            user
        },{
            status:200
        })

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: 'Internal Error'
        }, {
            status: 500
        })
    }
}