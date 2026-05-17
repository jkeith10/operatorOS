import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: user } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (!user?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
