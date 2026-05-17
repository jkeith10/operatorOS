import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICES: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const priceId = PRICES[plan];
  if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
    client_reference_id: userId,
    ...(email ? { customer_email: email } : {}),
  });

  return NextResponse.json({ url: session.url });
}
