import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardClient from "@/components/DashboardClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;

  const { data: user } = await supabase
    .from("users")
    .select("plan,usage_count,usage_reset_at,email,name")
    .eq("id", userId)
    .single();

  if (!user?.plan) redirect("/onboarding");

  const { data: letters } = await supabase
    .from("letters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      userId={userId}
      user={user}
      letters={letters ?? []}
      upgraded={params.upgraded === "true"}
    />
  );
}
