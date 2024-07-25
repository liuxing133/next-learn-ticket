import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
interface RecordRequst {
    userId: string;
    topicId: string;
    choice?: string;
}
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const record = await prisma.record.findFirst({
        where: {
            userId: searchParams.get("userId") ?? "",
            topicId: searchParams.get("topicId") ?? ""
        }
    });
    if (!record) {
        return NextResponse.json({
            message: "cant finde record"
        }, { status: 400 })
    }
    return NextResponse.json({
        record
    }, { status: 200 })
}

export async function POST(request: NextRequest) {
    try {
        const { userId, topicId, choice } = (await request.json()) as RecordRequst
        if (!userId || !topicId || !choice) {
            return NextResponse.json({
                message: "bad request"
            }, { status: 400 })
        }
        let record;
        await prisma.$transaction(async (prisma) => {
            const oldRecord = await prisma.record.findFirst({
                where: {
                    topicId: topicId,
                    userId: userId
                }
            });
            if (oldRecord) {
                const topic = await prisma.topic.findUnique({
                    where: {
                        id: Number(topicId)
                    },
                    include: {
                        options: true
                    }
                })
                console.log(oldRecord, '111111111111111111111');

                const selectedOption = topic?.options.find(
                    option => option.key === oldRecord.choice
                )
                await prisma.options.update({
                    where: {
                        id: selectedOption?.id
                    },
                    data: {
                        value: selectedOption!.value - 1
                    }
                })
                await prisma.record.delete({
                    where: {
                        id: oldRecord?.id
                    }
                })
            }

            const topic = await prisma.topic.findUnique({
                where: {
                    id: Number(topicId)
                },
                include: {
                    options: true
                }
            })
            const selectedOption = topic?.options.find(option => option.key === choice)
            await prisma.options.update({
                where: {
                    id: selectedOption?.id
                },
                data: {
                    value: selectedOption!.value + 1
                }
            })
            record = await prisma.record.create({
                data: {
                    topicId,
                    userId,
                    choice
                }
            })

        })
        return NextResponse.json({
            record
        }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: "Internal error"
        }, { status: 500 })
    }
}