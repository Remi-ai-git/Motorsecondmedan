import { google } from "@ai-sdk/google";
import { streamText, type Message } from "ai";
import { aiTools } from "@/lib/ai/tools";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 30;

// Maks 15 pesan / menit per IP — cukup longgar untuk percakapan normal,
// tapi meredam bot yang spam endpoint ini (biaya Gemini API per-panggilan).
const CHAT_LIMIT = 15;
const CHAT_WINDOW_MS = 60_000;

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
  const ip = getClientIp(req);
  const limit = rateLimit(`chat:${ip}`, CHAT_LIMIT, CHAT_WINDOW_MS);
  if (!limit.allowed) {
    return Response.json(
      {
        error:
          "Terlalu banyak pesan dalam waktu singkat. Coba lagi sebentar lagi ya.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((limit.resetAt - Date.now()) / 1000)
          ),
        },
      }
    );
  }

  const { messages, sessionId } = (await req.json()) as {
    messages: Message[];
    sessionId?: string;
  };

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? "";
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const result = streamText({
    // Model ringan & murah (Flash-Lite). Catatan: gemini-3.1-flash-lite
    // sempat dicoba tapi bikin tool-calling (searchMotors, compareMotors,
    // dll) hang tanpa respons — kemungkinan @ai-sdk/google@1.2.19 (versi
    // terpasang) belum kompatibel dengan format function-calling Gemini 3.x.
    // gemini-2.5-flash-lite tetap murah & terbukti jalan dengan tool calls.
    model: google("gemini-2.5-flash-lite"),
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

  return result.toDataStreamResponse({
    // TEMPORARY debugging — tampilkan pesan error asli ke client supaya
    // gampang didiagnosis. HAPUS/kembalikan ke default setelah bug beres,
    // karena bisa membocorkan detail internal ke pengguna.
    getErrorMessage: (error) => {
      console.error("Chat stream error:", error);
      if (error instanceof Error) return `${error.name}: ${error.message}`;
      return JSON.stringify(error);
    },
  });
}
