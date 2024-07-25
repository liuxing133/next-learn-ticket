import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
interface TopicRequest {
    userId: string;
    avatar: string;
    content: string;
    images: string;
    options: string[]
}
const prisma = new PrismaClient();
export async function GET() {

    try {
        const topics = await prisma.topic.findMany({
            include: {
                options: true
            }
        })
        const processedTopics = topics.map(topic => ({
            ...topic,
            images: topic.images ? topic.images.split(',') : [] // 假设以逗号分隔  
        }));
        console.log(processedTopics);
        
        return NextResponse.json({
            topics: processedTopics
        }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: "Internal error"
        }, { status: 500 })
    }
}
export async function POST(request: NextRequest) {
    try {
        const data = (await request.json()) as TopicRequest;
        const topic = await prisma.topic.create({
            data: {
                userId: data.userId,
                avatar: data.avatar,
                content: data.content,
                images: data.images,
                options: {
                    create: data.options.map((item) => (
                        {
                            key: item,
                            value: 0,
                        }
                    ))
                }
            },
            include: {
                options: true
            }
        })
        console.log(topic);
        return NextResponse.json(topic, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: 'Inernal error'
        }, {
            status: 500
        })
    }
}