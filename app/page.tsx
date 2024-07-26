"use client"

import { Button, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spacer, Tab, Textarea, useDisclosure } from "@nextui-org/react";
import { ThemeSwitcher } from "./components/themeSwitcher";
import UserSign from "./UserSign";
import { FileUp, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { CldUploadButton } from "next-cloudinary";
import { useAuth, useUser } from "@clerk/nextjs";
import { Topic } from "./utill/type";
import TicketTopic from "./components/TicketTopic";


export default function Home() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [content, setCountent] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [currentOption, setCurrentOption] = useState("")
  const [images, setImages] = useState<string[]>([])

  const [topics, setTopics] = useState<Topic[]>([]);

  const [reload, setReload] = useState(false);

  const { userId } = useAuth()
  const avatar = useUser().user?.imageUrl;

  useEffect(() => {
    const fetchData = async () => {
      const reslut = await fetch(`${process.env.API_ADDRESS}/api/topic`, {
        cache: "no-cache",
        method: "GET"
      })
      const data = await reslut.json();
      console.log(data.topics, '222222222222222222');

      setTopics(data.topics as Topic[])
    }
    fetchData()
  }, [reload])
  return (
    <div>
      <header className="w-full h-14" >
        <div className="fixed top-4 right-8 flex justify-stretch items-center" >
          <Button color="success" endContent={<Send />} onPress={onOpenChange}>
            发布
          </Button>
          <Spacer x={2} />
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">发布话题</ModalHeader>
                  <ModalBody>
                    <Textarea
                      label="内容"
                      placeholder="写一篇话题吧！"
                      variant="underlined"
                      labelPlacement="outside"
                      value={content}
                      onValueChange={setCountent}
                    />
                    <Spacer x={2} />
                    <CldUploadButton uploadPreset="beln9yd7" onSuccess={(reslut) => {
                      // @ts-ignore
                      setImages([...images, reslut.info?.url])
                    }}>
                      <button className="bg-secondary-400 hover:bg-secondary-700 text-white font-bold py-2 px-4 rounded-lg">
                        <div className="flex">
                          <FileUp />
                          <span>上传图片</span>
                        </div>
                      </button>
                    </CldUploadButton>
                    <Spacer x={2} />
                    <div className="flex items-center">
                      <Input
                        label={"请输入选项"}
                        variant={"faded"}
                        size="sm"
                        value={currentOption}
                        onValueChange={setCurrentOption}
                      />
                      <Spacer y={3} />
                      <Button color="success" onClick={() => {
                        setOptions([...options, currentOption])
                        setCurrentOption("")
                      }}>
                        添加
                      </Button>
                    </div>
                    <Spacer x={2} />
                    <div className="flex gap-2">
                      {options?.map((item, index) => {
                        return <Chip key={index} onClose={(e) => {
                          setOptions(options.filter(i => i !== item))
                        }}
                          variant="flat">
                          {item}
                        </Chip>
                      })}
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose} >
                      取消
                    </Button>
                    <Button color="primary" onPress={onClose} onClick={async () => {
                      const reslut = await fetch(process.env.API_ADDRESS + "/api/topic", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          userId: userId,
                          avatar: avatar,
                          content: content,
                          images: images.toString(),
                          options: options
                        })
                      });
                      console.log(reslut);
                      const data = (await reslut.json()) as Topic
                      setTopics([...topics, data]);
                      setOptions([])
                      setCountent('')
                      setCurrentOption('')
                      setImages([])
                      setReload(true)
                    }}>
                      确定
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
          <UserSign />
          <Spacer x={4} />
          <ThemeSwitcher />
        </div>
      </header>
      <div className="flex items-center justify-center m-4">
        <main className="flex flex-col items-center justify-center w-full border-x-2 sm:w-full md:w-9/12 lg:w-6/12">
          <Divider className="my-4" />
          {topics.length > 0 && topics.map((topic) => {
            return <TicketTopic {...topic} key={topic.id} />
          })}
        </main>
      </div>
    </div>
  );
}
