"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem("artamotor_chat_session");
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem("artamotor_chat_session", id);
  }
  return id;
}

const SUGGESTIONS = [
  "Saya punya budget 18 juta",
  "Motor irit untuk mahasiswa",
  "Beat vs Scoopy, bagus mana?",
  "Bagaimana proses kredit?",
];

/** Render link internal (/motor/...) dengan next/link, sisanya <a> biasa. */
function MdLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href ?? "#";
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="text-rose-600 underline">
        {props.children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => setSessionId(getSessionId()), []);

  const { messages, input, handleInputChange, handleSubmit, append, status } =
    useChat({
      api: "/api/chat",
      body: { sessionId },
    });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Buka chat AI"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition hover:scale-105 hover:bg-rose-700"
      >
        {open ? (
          <span className="text-xl">✕</span>
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:bottom-24 sm:right-5 sm:h-[560px] sm:w-96 sm:rounded-2xl sm:border sm:border-zinc-200">
          <div className="flex items-center justify-between rounded-t-2xl bg-rose-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Asisten Arta Motor</p>
              <p className="text-xs opacity-80">
                AI Sales Assistant · online 24 jam
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white sm:hidden"
              aria-label="Tutup chat"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-600">
                  Halo! 👋 Saya asisten AI Arta Motor. Ceritakan kebutuhan
                  Anda — budget, pemakaian, atau model incaran — saya carikan
                  motor yang pas.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => append({ role: "user", content: s })}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700 hover:bg-rose-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-rose-600 px-3 py-2 text-sm text-white"
                      : "chat-md max-w-[85%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm"
                  }
                >
                  {m.role === "user" ? (
                    m.content
                  ) : (
                    <ReactMarkdown components={{ a: MdLink }}>
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {busy && messages[messages.length - 1]?.role === "user" && (
              <div className="flex">
                <div className="rounded-2xl bg-zinc-100 px-3 py-2 text-sm text-zinc-500">
                  Mengetik…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-zinc-200 p-3"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Tulis pesan…"
              className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Kirim
            </button>
          </form>
        </div>
      )}
    </>
  );
}
