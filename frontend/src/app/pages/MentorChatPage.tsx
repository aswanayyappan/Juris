import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { mentors, Mentor } from "./MentorsPage";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Star,
  ChevronRight,
} from "lucide-react";

interface ChatMessage {
  id: string;
  from: "user" | "mentor";
  content: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

const mentorResponses: string[] = [
  "Thank you for reaching out! I've reviewed your question carefully.",
  "This is a common concern. Under the current regulatory framework, you need to ensure proper documentation.",
  "Yes, the deadline is crucial here. I recommend filing at least 7 days before the due date to avoid last-minute issues.",
  "From a compliance standpoint, you should first verify the applicable provisions. Shall I walk you through the relevant sections?",
  "That's a great question. The penalty for non-compliance can be significant, so let's address this proactively.",
  "I'd recommend we schedule a detailed session to cover all aspects. But briefly — you're on the right track.",
];

function getTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const sidebarMentors = mentors.filter((m) => m.available);

export function MentorChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mentor = mentors.find((m) => m.id === id);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(mentor || sidebarMentors[0] || null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeMentor) {
      setMessages([
        {
          id: "welcome",
          from: "mentor",
          content: `Hello! I'm ${activeMentor.name}. How can I assist you with your legal and compliance matters today?`,
          time: getTime(),
        },
      ]);
    }
  }, [activeMentor?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim() || !activeMentor) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      from: "user",
      content: input.trim(),
      time: getTime(),
      status: "sent",
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m))
      );
      setTimeout(() => {
        const reply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          from: "mentor",
          content:
            mentorResponses[Math.floor(Math.random() * mentorResponses.length)],
          time: getTime(),
        };
        setMessages((prev) => [...prev, reply]);
        setIsTyping(false);
      }, 800);
    }, 600);
  };

  if (!activeMentor) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0A1020" }}>
        <div className="text-center">
          <p className="text-sm" style={{ color: "#6B7280" }}>Mentor not found.</p>
          <button
            onClick={() => navigate("/mentors")}
            className="mt-3 text-xs"
            style={{ color: "#C9A84C" }}
          >
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex"
      style={{ height: "calc(100vh - 48px)", background: "#0A1020" }}
    >
      {/* Sidebar */}
      <div
        className="w-64 flex-shrink-0 flex flex-col border-r"
        style={{
          background: "#060B18",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <button
            onClick={() => navigate("/mentors")}
            className="flex items-center gap-2 text-xs mb-4"
            style={{ color: "#6B7280" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#E8EBF0")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#6B7280")}
          >
            <ArrowLeft size={13} />
            All Mentors
          </button>
          <p className="text-xs uppercase tracking-widest" style={{ color: "#374151", letterSpacing: "0.15em" }}>
            Online Now
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {sidebarMentors.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setActiveMentor(m);
                navigate(`/mentors/${m.id}`);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{
                background:
                  activeMentor?.id === m.id
                    ? "rgba(201,168,76,0.07)"
                    : "transparent",
                borderLeft: `2px solid ${activeMentor?.id === m.id ? "#C9A84C" : "transparent"}`,
              }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border"
                  style={{
                    background: "#22C55E",
                    borderColor: "#060B18",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs truncate" style={{ color: "#E8EBF0", fontWeight: 500 }}>
                  {m.name}
                </p>
                <p className="text-xs truncate" style={{ color: "#6B7280" }}>
                  {m.expertise[0]}
                </p>
              </div>
              <ChevronRight size={11} style={{ color: "#374151", flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div
          className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
          style={{
            background: "rgba(10,16,32,0.95)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <img
            src={activeMentor.avatar}
            alt={activeMentor.name}
            className="w-9 h-9 rounded-full object-cover"
            style={{ border: "1.5px solid rgba(201,168,76,0.25)" }}
          />
          <div className="flex-1">
            <p className="text-sm" style={{ color: "#E8EBF0", fontWeight: 500 }}>
              {activeMentor.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
              <span className="text-xs" style={{ color: "#6B7280" }}>
                Online · {activeMentor.title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md mr-2" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
              <Star size={11} style={{ color: "#F59E0B" }} />
              <span className="text-xs" style={{ color: "#C9A84C" }}>{activeMentor.rating}</span>
            </div>
            {[
              { icon: <Phone size={15} />, label: "Call" },
              { icon: <Video size={15} />, label: "Video" },
              { icon: <MoreVertical size={15} />, label: "More" },
            ].map((btn, i) => (
              <button
                key={i}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "#6B7280" }}
                title={btn.label}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#E8EBF0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Mentor Info Bar */}
        <div
          className="px-5 py-2 flex items-center gap-4 border-b"
          style={{
            background: "rgba(13,21,38,0.5)",
            borderColor: "rgba(255,255,255,0.04)",
          }}
        >
          {[
            { label: "Experience", value: activeMentor.experience },
            { label: "Consultations", value: `${activeMentor.chats}+` },
            { label: "Rate", value: activeMentor.fee },
            { label: "Languages", value: activeMentor.languages.slice(0, 2).join(", ") },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span style={{ color: "#374151" }}>{item.label}:</span>
              <span style={{ color: "#9CA3AF" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {/* Date divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
              <span className="text-xs px-2" style={{ color: "#374151" }}>Today</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.from === "mentor" && (
                  <img
                    src={activeMentor.avatar}
                    alt={activeMentor.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
                  />
                )}
                <div style={{ maxWidth: "480px" }}>
                  <div
                    className="px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background:
                        msg.from === "user"
                          ? "rgba(201,168,76,0.09)"
                          : "#0D1526",
                      border:
                        msg.from === "user"
                          ? "1px solid rgba(201,168,76,0.18)"
                          : "1px solid rgba(255,255,255,0.05)",
                      color: "#E8EBF0",
                      borderRadius:
                        msg.from === "user"
                          ? "14px 14px 4px 14px"
                          : "14px 14px 14px 4px",
                    }}
                  >
                    {msg.content}
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-1 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <span className="text-xs" style={{ color: "#374151" }}>
                      {msg.time}
                    </span>
                    {msg.from === "user" && msg.status && (
                      <span style={{ color: msg.status === "read" ? "#22C55E" : "#6B7280" }}>
                        {msg.status === "read" ? (
                          <CheckCheck size={11} />
                        ) : (
                          <Check size={11} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <img
                  src={activeMentor.avatar}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
                />
                <div
                  className="px-4 py-3 rounded-xl"
                  style={{
                    background: "#0D1526",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "14px 14px 14px 4px",
                  }}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          background: "#6B7280",
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

        {/* Input */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{
            background: "rgba(10,16,32,0.95)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="max-w-2xl mx-auto flex items-end gap-3">
            <button
              className="p-2 rounded-lg flex-shrink-0"
              style={{ color: "#6B7280" }}
            >
              <Paperclip size={16} />
            </button>

            <div
              className="flex-1 rounded-xl relative"
              style={{
                background: "#0D1526",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.parentElement!.style.borderColor = "rgba(201,168,76,0.4)";
                }}
                onBlur={(e) => {
                  e.currentTarget.parentElement!.style.borderColor = "rgba(255,255,255,0.07)";
                }}
                placeholder={`Message ${activeMentor.name.split(" ")[1]}...`}
                className="w-full px-4 py-3 resize-none text-sm outline-none"
                style={{
                  background: "transparent",
                  color: "#E8EBF0",
                  minHeight: "44px",
                  maxHeight: "120px",
                }}
                rows={1}
              />
            </div>

            <button
              className="p-2 rounded-lg flex-shrink-0"
              style={{ color: "#6B7280" }}
            >
              <Smile size={16} />
            </button>

            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl flex-shrink-0 transition-all disabled:opacity-40"
              style={{
                background: input.trim() ? "#C9A84C" : "rgba(201,168,76,0.15)",
                color: input.trim() ? "#060B18" : "#C9A84C",
              }}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "#1F2937" }}>
            Session is end-to-end encrypted · Rates apply per consultation
          </p>
        </div>
      </div>
    </div>
  );
}
