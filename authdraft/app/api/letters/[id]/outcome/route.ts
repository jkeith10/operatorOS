import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { outcome } = await req.json();

  if (outcome !== null && outcome !== "approved" && outcome !== "denied") {
    return NextResponse.json({ error: "Invalid outcome value" }, { status: 400 });
  }

  // Verify the letter belongs to this user
  const { data: existing } = await supabase
    .from("letters")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("letters")
    .update({ outcome })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
