import { Modal, Button } from "flowbite-react";
import { useAuth } from "../context/useAuth";
import { useEffect, useRef, useState } from "react";
import api from "../services/axios";

type ChatModalProps = {
  show: boolean;
  onClose: () => void;
  otherUsername: string;
};

type Message = {
  id?: number;
  sender: {
    username: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  };
  recipient: {
    username: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  };
  content: string;
  timestamp: string;
};

export default function ChatModal({ show, onClose, otherUsername }: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (show && user) {
      const token = localStorage.getItem("accessToken");
      ws.current = new WebSocket(
        `ws://localhost:8000/ws/chat/${otherUsername}/?token=${token}`
      );

      ws.current.onmessage = (e) => {
        const data = JSON.parse(e.data);

        const hydrated: Message = {
          ...data,
          sender: typeof data.sender === "string"
            ? {
              username: data.sender,
              first_name: "",
              last_name: "",
              profile_picture: null,
            }
            : data.sender,
          recipient: typeof data.recipient === "string"
            ? {
              username: data.recipient,
              first_name: "",
              last_name: "",
              profile_picture: null,
            }
            : data.recipient,
        };

        setMessages((prev) => [...prev, hydrated]);
      };

      ws.current.onclose = () => console.log("WebSocket disconnected");
    }

    return () => {
      ws.current?.close();
    };
  }, [show, user, otherUsername]);

  useEffect(() => {
    if (!show) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/history/${otherUsername}/`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    };

    fetchMessages();
  }, [show, otherUsername]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, show]);

  const handleSend = () => {
    if (ws.current && input.trim()) {
      ws.current.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="lg" theme={{
      content: {
        base: "bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-lg max-w-3xl",
      },
    }}>
      <div className="flex flex-col h-[500px]">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Pokalbis su {otherUsername}</h3>
          <Button size="xs" onClick={onClose} color="yellow">
            Uždaryti
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {messages.map((msg, index) => {
            const isSender = msg.sender.username === user?.username;

            const avatarUrl = msg.sender.profile_picture
              ? `http://localhost:8000${msg.sender.profile_picture}`
              : `https://ui-avatars.com/api/?name=${msg.sender.first_name}+${msg.sender.last_name}&background=0D8ABC&color=fff`;

            return (
              <div
                key={index}
                className={`flex w-full gap-2 ${isSender ? "justify-end" : "justify-start"}`}
              >
                {!isSender && (
                  <div className="flex flex-col items-center pt-[22px]">
                    <img
                      src={avatarUrl}
                      alt={msg.sender.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                )}

                <div className={`flex flex-col max-w-[75%] ${isSender ? "items-end" : "items-start"}`}>
                  <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    {msg.sender.first_name} {msg.sender.last_name}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm shadow leading-snug break-words ${isSender
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                  >
                    {msg.content}
                  </div>
                  <div
                    className={`text-[10px] mt-1 ${isSender ? "text-blue-200" : "text-gray-400"
                      }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {isSender && (
                  <div className="flex flex-col items-center pt-[22px]">
                    <img
                      src={avatarUrl}
                      alt={msg.sender.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>


            );
          })}
        </div>

        <div className="flex items-center p-4 border-t gap-2">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Rašyk žinutę..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button onClick={handleSend} size="sm">
            Siųsti
          </Button>
        </div>
      </div>
    </Modal>
  );
}


