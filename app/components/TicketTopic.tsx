"use client"

import { useAuth } from "@clerk/nextjs";
import { Card, CardHeader, CardBody, Image, Avatar, Divider, CardFooter, Progress, } from "@nextui-org/react";
import { RadioGroup, Radio, useRadio, VisuallyHidden, cn } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Record } from "../utill/type";
interface Props {
    id?: string;
    avatar?: string;
    userId?: string;
    content?: string;
    images?: string[];
    options: Array<{ key: string, value: number }>
}

function TicketTopic(props: Props) {

    const [selectedChoice, setSelectedChoice] = useState<string>('')

    const [isVote, setIsVote] = useState(false)

    const [record, setRecord] = useState<Record>()

    const [options, setOptions] = useState<typeof props.options>(props.options)

    const [count, setCount] = useState(props.options.reduce((acc, item) => acc + item.value, 0));

    const { userId } = useAuth()

    useEffect(() => {
        console.log(userId, "55555555555555555555555555555555");
        const fetchIsVote = async () => {
            const reslut = await fetch(`${process.env.API_ADDRESS}/api/topic/record?userId=${userId}&topicId=${props.id}`, { method: "GET" });
            if (reslut.status === 200) {
                setIsVote(true)
                const data = await reslut.json()
                const record = data.record as Record
                setRecord(record)
                setSelectedChoice(record.choice)
            }
        }
        fetchIsVote()
    }, [props.id, userId])
    return <>
        <div className="w-10/12">
            <Card >
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                    <Avatar src={props.avatar} />
                    <h4 className="text-lg font-bold">{props.userId}</h4>
                    <p className="text-tiny font-semibold">{props.content}</p>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                    {(props.images && Array.isArray(props.images)) && props.images.map((image, index) => (
                        <Image
                            key={index}
                            alt="Card image"
                            className="object-cover rounded-xl my-1"
                            src={image}
                            width={270}
                        />
                    ))}
                </CardBody>
                <CardFooter className="px-4 py-2 flex flex-col justify-center">
                    <RadioGroup orientation="horizontal" value={selectedChoice} onValueChange={async (value) => {
                        const newOptions = options?.map((item) => {
                            if (item.key === value) {
                                return {
                                    key: item.key,
                                    value: item.value + 1
                                }
                            }
                            if (item.key === selectedChoice) {
                                return {
                                    key: item.key,
                                    value: item.value - 1
                                }
                            }
                            return item
                        })
                        setOptions(newOptions);
                        if (selectedChoice === "") setCount(count + 1)
                        setSelectedChoice(value);
                        const reault = await fetch(`${process.env.API_ADDRESS}/api/topic/record`, {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                topicId: props.id?.toString(),
                                userId,
                                choice: value
                            })
                        })
                        console.log(reault, "11111111111111111111111111reault");

                        if (reault.status === 200) {
                            setIsVote(true)
                        }
                    }}>
                        {props.options?.map((item) => {
                            return <Radio
                                key={item.key}
                                value={item.key}
                                classNames={{
                                    base: cn(
                                        "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                                        "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                                        "data-[selected=true]:border-primary"
                                    ),
                                }}
                            >
                                {item.key}
                            </Radio>
                        })}
                    </RadioGroup>
                    {isVote &&
                        options?.map((item) => {
                            return <Progress
                                key={item.key}
                                size="sm"
                                radius="sm"
                                classNames={{
                                    base: "max-w-md",
                                    track: "drop-shadow-md border border-default",
                                    indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                                    label: "tracking-wider font-medium text-default-600",
                                    value: "text-foreground/60",
                                }}
                                label={item.key}
                                value={count === 0 ? 0 : (item.value / count * 100)}
                                showValueLabel={true}
                            />
                        })

                    }
                </CardFooter>
            </Card>
        </div>
        <Divider className="my-5" />
    </>
}
export default TicketTopic;