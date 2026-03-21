import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp,
  Paperclip,
  Scale,
  Bot,
  User,
  FileText,
  BookOpen,
  Gavel,
  Shield,
  RotateCcw,
  Copy,
  CheckCheck,
  Mic,
  Users,
} from "lucide-react";
import { api } from "../utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation } from "react-router";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
}

const getInitialMessages = (persona: string): Message[] => [
  {
    id: "1",
    role: "ai",
    content: persona === "mentor"
      ? "Hello! I'm your JURIS AI Mentor. I'm here to support and guide you through your business compliance journey. How can I help you today? Feel free to ask anything!"
      : "I am the JURIS Legal Assistant. State your corporate legal or tax compliance inquiry, and I will provide formal, structured legal guidance.",
    time: "09:00 AM",
  },
];

const quickPrompts = [
  { icon: <FileText size={13} />, label: "GST Return Deadline" },
  { icon: <Gavel size={13} />, label: "Labour Law Basics" },
  { icon: <BookOpen size={13} />, label: "ROC Annual Filing" },
  { icon: <Shield size={13} />, label: "Compliance Checklist" },
];



function getTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatPage() {
  const location = useLocation();
  const persona = location.state?.persona || 'advisor';
  
  const [messages, setMessages] = useState<Message[]>(getInitialMessages(persona));
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Reset chat if persona strictly changes seamlessly
  useEffect(() => {
    setMessages(getInitialMessages(persona));
  }, [persona]);

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "48px";
    ta.style.height = Math.min(ta.scrollHeight, 150) + "px";
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    setIsTyping(true);
    
    try {
      const response = await api.post<{ reply: string }>("/chat", { message: content, persona });
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.reply,
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I encountered an error connecting to the JURIS AI server. Please try again.",
        time: getTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className="flex flex-col"
      style={{
        height: "calc(100vh - 48px)",
        background: "#0A1020",
      }}
    >
      {/* Chat Header */}
      <div
        className="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0"
        style={{
          background: "rgba(10,16,32,0.9)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: persona === "mentor" ? "rgba(34,197,94,0.12)" : "rgba(201,168,76,0.12)" }}
        >
          {persona === "mentor" ? (
             <Users size={16} style={{ color: "#22C55E" }} />
          ) : (
             <Bot size={16} style={{ color: "#C9A84C" }} />
          )}
        </div>
        <div>
          <p className="text-sm" style={{ color: "#E8EBF0", fontWeight: 500 }}>
            {persona === "mentor" ? "JURIS AI Mentor" : "JURIS Legal Advisor"}
          </p>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: persona === "mentor" ? "#22C55E" : "#C9A84C" }}
            />
            <p className="text-xs" style={{ color: "#6B7280" }}>
              {persona === "mentor" ? "Online · Supportive Guidance" : "Online · Indian Law Expert"}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#6B7280",
            }}
            onClick={() => setMessages(getInitialMessages(persona))}
          >
            <RotateCcw size={12} />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{
                  background:
                    msg.role === "ai"
                      ? persona === "mentor" ? "rgba(34,197,94,0.12)" : "rgba(201,168,76,0.12)"
                      : "rgba(255,255,255,0.05)",
                }}
              >
                {msg.role === "ai" ? (
                   persona === "mentor" ? <Users size={13} style={{ color: "#22C55E" }} /> : <Scale size={13} style={{ color: "#C9A84C" }} />
                ) : (
                  <User size={13} style={{ color: "#9CA3AF" }} />
                )}
              </div>

              {/* Bubble */}
              <div
                className="max-w-lg group relative"
                style={{ maxWidth: "520px" }}
              >
                <div
                  className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === "ai" ? "[&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>h3]:font-bold [&>h3]:mt-3" : ""}`}
                  style={{
                    background:
                      msg.role === "user"
                        ? "rgba(201,168,76,0.08)"
                        : "#0D1526",
                    border:
                      msg.role === "user"
                        ? "1px solid rgba(201,168,76,0.15)"
                        : "1px solid rgba(255,255,255,0.05)",
                    color: "#E8EBF0",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                  }}
                >
                  {msg.role === "ai" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <span className="text-xs" style={{ color: "#374151" }}>
                    {msg.time}
                  </span>
                  {msg.role === "ai" && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied === msg.id ? (
                        <CheckCheck size={11} style={{ color: "#22C55E" }} />
                      ) : (
                        <Copy size={11} style={{ color: "#6B7280" }} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: "rgba(201,168,76,0.12)" }}
              >
                <Scale size={13} style={{ color: "#C9A84C" }} />
              </div>
              <div
                className="px-4 py-3 rounded-xl"
                style={{
                  background: "#0D1526",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px 16px 16px 4px",
                }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: "#C9A84C",
                        opacity: 0.6,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-6 pb-3">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
              style={{
                background: "rgba(13,21,38,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#9CA3AF",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.3)";
                (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
              }}
            >
              {q.icon}
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div
        className="px-6 pb-6 flex-shrink-0"
        style={{ background: "#0A1020" }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="relative rounded-xl"
            style={{
              background: "#0D1526",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              onFocus={(e) => {
                e.currentTarget.parentElement!.style.borderColor =
                  "rgba(201,168,76,0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.parentElement!.style.borderColor =
                  "rgba(255,255,255,0.07)";
              }}
              placeholder="Ask about GST, labour law, ROC filings, income tax..."
              className="w-full px-4 pt-4 pb-12 resize-none text-sm outline-none"
              style={{
                background: "transparent",
                color: "#E8EBF0",
                minHeight: "48px",
                maxHeight: "150px",
                lineHeight: 1.6,
                overflow: "hidden",
              }}
            />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded transition-colors"
                  style={{ color: "#6B7280" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "#6B7280")
                  }
                >
                  <Paperclip size={14} />
                </button>
                <button
                  className="p-1.5 rounded transition-colors"
                  style={{ color: "#6B7280" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "#6B7280")
                  }
                >
                  <Mic size={14} />
                </button>
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-40"
                style={{
                  background: input.trim() && !isTyping
                    ? "#C9A84C"
                    : "rgba(201,168,76,0.2)",
                  color: input.trim() && !isTyping ? "#060B18" : "#C9A84C",
                }}
              >
                <ArrowUp size={13} />
                <span>Send</span>
              </button>
            </div>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "#374151" }}>
            JURIS AI · Not a substitute for professional legal advice
          </p>
        </div>
      </div>
    </div>
  );
}
