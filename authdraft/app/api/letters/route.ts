import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: letters } = await supabase
    .from("letters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ letters: letters ?? [] });
}
