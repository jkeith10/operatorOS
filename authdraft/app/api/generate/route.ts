import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic();

const LIMITS: Record<string, number> = { starter: 50, pro: Infinity };

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { insurer, requestType, patientAge, diagnosis, procedure, clinicalNotes } = await req.json();
  if (!insurer || !diagnosis || !procedure) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("plan,usage_count,usage_reset_at")
    .eq("id", userId)
    .single();

  if (!user?.plan) return NextResponse.json({ error: "No active plan" }, { status: 403 });

  const limit = LIMITS[user.plan] ?? 0;
  const resetDate = new Date(user.usage_reset_at);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const currentUsage = resetDate < monthAgo ? 0 : user.usage_count;

  if (currentUsage >= limit) {
    return NextResponse.json({ error: "Monthly limit reached" }, { status: 429 });
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are a senior medical billing specialist with 15 years of experience writing prior authorization requests and insurance appeal letters. Write professional, medically precise letters that maximize approval rates. Use formal clinical language. Always include [DATE], [PROVIDER NAME], [NPI], [PATIENT NAME], [MEMBER ID], [GROUP NUMBER] as placeholders. Output ONLY the letter text, no commentary or preamble.`,
    messages: [
      {
        role: "user",
        content: `Write a ${requestType} letter for:
- Insurer: ${insurer}
- Patient age: ${patientAge || "not specified"}
- Diagnosis: ${diagnosis}
- Procedure: ${procedure}
${clinicalNotes ? `- Clinical notes: ${clinicalNotes}` : ""}`,
      },
    ],
  });

  const letterText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const [{ data: letter }] = await Promise.all([
    supabase
      .from("letters")
      .insert({
        user_id: userId,
        insurer,
        request_type: requestType,
        patient_age: patientAge || null,
        diagnosis,
        procedure,
        clinical_notes: clinicalNotes || null,
        letter_text: letterText,
      })
      .select()
      .single(),
    supabase
      .from("users")
      .update({
        usage_count: currentUsage + 1,
        ...(resetDate < monthAgo ? { usage_reset_at: new Date().toISOString() } : {}),
      })
      .eq("id", userId),
  ]);

  return NextResponse.json({ letter: letterText, letterId: letter?.id });
}
