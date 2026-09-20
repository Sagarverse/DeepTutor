"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  Bot,
  User,
  Database,
  Globe,
  Calculator,
  FileText,
  Microscope,
  Lightbulb,
  Trash2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Edit3,
  GraduationCap,
  PenTool,
  Save,
  ScanLine,
  BarChart3,
  FileType,
  ClipboardList,
  Mic,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useGlobal } from "@/context/GlobalContext";
import { apiUrl } from "@/lib/api";
import { processLatexContent } from "@/lib/latex";
import AddToNotebookModal from "@/components/AddToNotebookModal";
import { useTranslation } from "react-i18next";

interface KnowledgeBase {
  name: string;
  is_default?: boolean;
}

export default function HomePage() {
  const {
    chatState,
    setChatState,
    sendChatMessage,
    clearChatHistory,
    newChatSession,
  } = useGlobal();
  const { t } = useTranslation();

  const [inputMessage, setInputMessage] = useState("");
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showNotebookModal, setShowNotebookModal] = useState(false);

  // Format chat history for notebook
  const formatChatForNotebook = () => {
    if (chatState.messages.length === 0)
      return { title: "", userQuery: "", output: "" };

    const firstUserMsg = chatState.messages.find((m) => m.role === "user");
    const title =
      firstUserMsg?.content.slice(0, 50) +
        (firstUserMsg && firstUserMsg.content.length > 50 ? "..." : "") ||
      t("Chat Session");

    const formattedMessages = chatState.messages
      .map((msg, idx) => {
        const roleLabel =
          msg.role === "user"
            ? `👤 **${t("User")}**`
            : `🤖 **${t("Assistant")}**`;
        return `### ${roleLabel}\n\n${msg.content}`;
      })
      .join("\n\n---\n\n");

    const userQueries = chatState.messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n\n");

    return {
      title: `Chat: ${title}`,
      userQuery: userQueries,
      output: formattedMessages,
    };
  };

  // Fetch knowledge bases
  useEffect(() => {
    fetch(apiUrl("/api/v1/knowledge/list"))
      .then((res) => res.json())
      .then((data) => {
        const kbList = Array.isArray(data) ? data : [];
        setKbs(kbList);
        if (!chatState.selectedKb && kbList.length > 0) {
          const defaultKb = kbList.find((kb: KnowledgeBase) => kb.is_default);
          if (defaultKb) {
            setChatState((prev) => ({ ...prev, selectedKb: defaultKb.name }));
          } else {
            setChatState((prev) => ({ ...prev, selectedKb: kbList[0].name }));
          }
        }
      })
      .catch((err) => console.error("Failed to fetch KBs:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatState.messages]);

  const handleSend = () => {
    if (!inputMessage.trim() || chatState.isLoading) return;
    sendChatMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Feature cards matching Examix design
  const featureCards = [
    {
      icon: ScanLine,
      label: t("Scan"),
      description: t("Handwritten documents"),
      href: "/knowledge",
    },
    {
      icon: BarChart3,
      label: t("Analyze"),
      description: t("Text, data, images, audio"),
      href: "/research",
    },
    {
      icon: FileType,
      label: t("Convert"),
      description: t("PDF, PNG, DOC, JPG..."),
      href: "/knowledge",
    },
    {
      icon: ClipboardList,
      label: t("Make Test"),
      description: t("Creating a test from..."),
      href: "/question",
    },
  ];

  // Quick actions for expanded view
  const quickActions = [
    {
      icon: Calculator,
      label: t("Smart Problem Solving"),
      href: "/solver",
      description: t("Multi-agent reasoning"),
    },
    {
      icon: PenTool,
      label: t("Generate Practice Questions"),
      href: "/question",
      description: t("Auto-validated quizzes"),
    },
    {
      icon: Microscope,
      label: t("Deep Research Reports"),
      href: "/research",
      description: t("Comprehensive analysis"),
    },
    {
      icon: Lightbulb,
      label: t("Generate Novel Ideas"),
      href: "/ideagen",
      description: t("Brainstorm & synthesize"),
    },
    {
      icon: GraduationCap,
      label: t("Guided Learning"),
      href: "/guide",
      description: t("Step-by-step tutoring"),
    },
    {
      icon: Edit3,
      label: t("Co-Writer"),
      href: "/co_writer",
      description: t("Collaborative writing"),
    },
  ];

  // Mock recent chats for UI demo
  const recentChats = [
    { icon: MessageSquare, text: t("Derivative and its properties, basic theorems about...") },
    { icon: Mic, text: t("Sample characteristics: mean, median, variance in...") },
    { icon: MessageSquare, text: t("Area of shapes, calculating areas using a definite integral...") },
  ];

  const hasMessages = chatState.messages.length > 0;

  return (
    <div className="h-screen flex flex-col">
      {/* Empty State / Welcome Screen - Examix Style */}
      {!hasMessages && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Welcome Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t("Welcome!")}
            </h1>
            <p className="text-2xl md:text-3xl font-light">
              <span className="text-emerald-400">{t("How Can I help")}</span>
              <br />
              <span className="text-white">{t("You Today?")}</span>
            </p>
          </div>

          {/* Feature Cards Grid - Examix Style */}
          <div className="w-full max-w-lg mx-auto mb-10">
            <div className="grid grid-cols-2 gap-4">
              {featureCards.map((card, i) => (
                <Link
                  key={i}
                  href={card.href}
                  className="group p-4 rounded-2xl bg-[#111a11]/80 border border-[#1a2d1a] hover:border-emerald-500/30 hover:bg-[#162016] transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a2d1a] flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                    <card.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {card.label}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {card.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Chat Section */}
          <div className="w-full max-w-lg mx-auto mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                {t("Recent Chat")}
              </h3>
              <Link href="/history" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                {t("See more")}
              </Link>
            </div>
            <div className="space-y-2">
              {recentChats.map((chat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#111a11]/60 border border-[#1a2d1a]/50 hover:bg-[#162016] transition-colors cursor-pointer"
                >
                  <chat.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-400 truncate">{chat.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Input Box - Examix Style */}
          <div className="w-full max-w-lg mx-auto">
            {/* Mode Toggles */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() =>
                  setChatState((prev) => ({
                    ...prev,
                    enableRag: !prev.enableRag,
                  }))
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  chatState.enableRag
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-[#1a2d1a] text-gray-400 border border-[#1a2d1a] hover:border-gray-600"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                {t("RAG")}
              </button>

              <button
                onClick={() =>
                  setChatState((prev) => ({
                    ...prev,
                    enableWebSearch: !prev.enableWebSearch,
                  }))
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  chatState.enableWebSearch
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-[#1a2d1a] text-gray-400 border border-[#1a2d1a] hover:border-gray-600"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                {t("Web")}
              </button>

              {chatState.enableRag && kbs.length > 0 && (
                <select
                  value={chatState.selectedKb}
                  onChange={(e) =>
                    setChatState((prev) => ({
                      ...prev,
                      selectedKb: e.target.value,
                    }))
                  }
                  className="text-xs bg-[#1a2d1a] border border-[#1a2d1a] rounded-full px-3 py-1.5 outline-none text-gray-300 focus:border-emerald-500/30"
                >
                  {kbs.map((kb) => (
                    <option key={kb.name} value={kb.name}>
                      {kb.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Input Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <FolderOpen className="w-5 h-5 text-gray-500" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-12 pr-24 py-4 bg-[#111a11] border border-[#1a2d1a] rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-600 text-white"
                placeholder={t("Message")}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={chatState.isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-emerald-400 transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={chatState.isLoading || !inputMessage.trim()}
                  className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all"
                >
                  {chatState.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid - Expanded for more options */}
          <div className="w-full max-w-3xl mx-auto mt-10">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">
              {t("Explore Modules")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="group p-4 rounded-2xl bg-[#111a11]/60 border border-[#1a2d1a] hover:border-emerald-500/30 hover:bg-[#162016] transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#1a2d1a] flex items-center justify-center mb-2 group-hover:bg-emerald-500/20 transition-colors">
                    <action.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="font-medium text-white text-sm mb-0.5">
                    {action.label}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface - When there are messages */}
      {hasMessages && (
        <>
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a2d1a] bg-[#0a0f0a]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {/* Mode Toggles */}
              <button
                onClick={() =>
                  setChatState((prev) => ({
                    ...prev,
                    enableRag: !prev.enableRag,
                  }))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  chatState.enableRag
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-[#1a2d1a] text-gray-400"
                }`}
              >
                <Database className="w-3 h-3" />
                {t("RAG")}
              </button>

              <button
                onClick={() =>
                  setChatState((prev) => ({
                    ...prev,
                    enableWebSearch: !prev.enableWebSearch,
                  }))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  chatState.enableWebSearch
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-[#1a2d1a] text-gray-400"
                }`}
              >
                <Globe className="w-3 h-3" />
                {t("Web Search")}
              </button>

              {chatState.enableRag && (
                <select
                  value={chatState.selectedKb}
                  onChange={(e) =>
                    setChatState((prev) => ({
                      ...prev,
                      selectedKb: e.target.value,
                    }))
                  }
                  className="text-xs bg-[#1a2d1a] border-0 rounded-lg px-2 py-1 outline-none text-gray-300"
                >
                  {kbs.map((kb) => (
                    <option key={kb.name} value={kb.name}>
                      {kb.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotebookModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                title={t("Save to Notebook")}
              >
                <Save className="w-3.5 h-3.5" />
                {t("Save to Notebook")}
              </button>
              <button
                onClick={newChatSession}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t("New Chat")}
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          >
            {chatState.messages.map((msg, idx) => (
              <div
                key={idx}
                className="flex gap-4 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2"
              >
                {msg.role === "user" ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-[#1a2d1a] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 bg-[#1a2d1a] px-4 py-3 rounded-2xl rounded-tl-none text-gray-200">
                      {msg.content}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="bg-[#111a11] px-5 py-4 rounded-2xl rounded-tl-none border border-[#1a2d1a] shadow-sm">
                        <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-code:text-emerald-400 prose-a:text-emerald-400">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {processLatexContent(msg.content)}
                          </ReactMarkdown>
                        </div>

                        {/* Loading indicator */}
                        {msg.isStreaming && (
                          <div className="flex items-center gap-2 mt-3 text-emerald-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t("Generating response...")}</span>
                          </div>
                        )}
                      </div>

                      {/* Sources */}
                      {msg.sources &&
                        (msg.sources.rag?.length ?? 0) +
                          (msg.sources.web?.length ?? 0) >
                          0 && (
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.rag?.map((source, i) => (
                              <div
                                key={`rag-${i}`}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs border border-emerald-500/20"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>{source.kb_name}</span>
                              </div>
                            ))}
                            {msg.sources.web?.slice(0, 3).map((source, i) => (
                              <a
                                key={`web-${i}`}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                              >
                                <Globe className="w-3 h-3" />
                                <span className="max-w-[150px] truncate">
                                  {source.title || source.url}
                                </span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Status indicator */}
            {chatState.isLoading && chatState.currentStage && (
              <div className="flex gap-4 w-full max-w-4xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="flex-1 bg-[#111a11] px-4 py-3 rounded-2xl rounded-tl-none border border-[#1a2d1a]">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {chatState.currentStage === "rag" &&
                      t("Searching knowledge base...")}
                    {chatState.currentStage === "web" &&
                      t("Searching the web...")}
                    {chatState.currentStage === "generating" &&
                      t("Generating response...")}
                    {!["rag", "web", "generating"].includes(
                      chatState.currentStage,
                    ) && chatState.currentStage}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-[#1a2d1a] bg-[#0a0f0a] px-6 py-4">
            <div className="max-w-4xl mx-auto relative">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-5 py-3.5 pr-14 bg-[#111a11] border border-[#1a2d1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-gray-600 text-white"
                placeholder={t("Type your message...")}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={chatState.isLoading}
              />
              <button
                onClick={handleSend}
                disabled={chatState.isLoading || !inputMessage.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all"
              >
                {chatState.isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add to Notebook Modal */}
      <AddToNotebookModal
        isOpen={showNotebookModal}
        onClose={() => setShowNotebookModal(false)}
        recordType="chat"
        title={formatChatForNotebook().title}
        userQuery={formatChatForNotebook().userQuery}
        output={formatChatForNotebook().output}
        metadata={{
          session_id: chatState.sessionId,
          message_count: chatState.messages.length,
          enable_rag: chatState.enableRag,
          enable_web_search: chatState.enableWebSearch,
        }}
        kbName={chatState.enableRag ? chatState.selectedKb : undefined}
      />
    </div>
  );
}
