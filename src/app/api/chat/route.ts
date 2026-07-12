import { google } from "@ai-sdk/google";
import { streamText, type Message } from "ai";
import { aiTools } from "@/lib/ai/tools";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { getSupabaseAdmin } from "@/lib/supabase";

export const maxDuration = 30;

async function saveHistory(
  sessionId: string,
  userMessage: string,
  assistantMessage: string
) {
  const admin = getSupabaseAdmin();
  if (!admin || !sessionId) return; // penyimpanan riwayat opsional
  try {
    await admin
      .from("chat_sessions")
      .upsert({ session_id: sessionId }, { onConflict: "session_id" });
    await admin.from("chat_messages").insert([
      { session_id: sessionId, role: "user", content: userMessage },
      { session_id: sessionId, role: "assistant", content: assistantMessage },
    ]);
  } catch {
    // jangan gagalkan respons hanya karena logging riwayat gagal
  }
}

export async function POST(req: Request) {
  const { messages, sessionId } = (await req.json()) as {
    messages: Message[];
    sessionId?: string;
  };

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? "";
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: buildSystemPrompt(waNumber),
    messages,
    tools: aiTools,
    maxSteps: 5,
    onFinish: async ({ text }) => {
      if (sessionId && text) {
        await saveHistory(sessionId, String(lastUser), text);
      }
    },
  });

  return result.toDataStreamResponse();
}
