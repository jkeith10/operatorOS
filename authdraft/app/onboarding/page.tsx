import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import OnboardingClient from "@/components/OnboardingClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  if (user?.plan) redirect("/dashboard");

  const clerkUser = await currentUser();

  // Sync user to Supabase
  if (clerkUser) {
    await supabase.from("users").upsert({
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
    }, { onConflict: "id" });
  }

  return <OnboardingClient />;
}
