import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_STARTER_PRICE_ID!]: "starter",
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
};

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (!userId) break;

      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      // Retrieve subscription to get plan
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      const plan = PLAN_MAP[priceId] ?? null;

      await supabase.from("users").upsert(
        {
          id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
        },
        { onConflict: "id" }
      );
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = PLAN_MAP[priceId] ?? null;

      await supabase
        .from("users")
        .update({ plan, stripe_subscription_id: subscription.id })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("users")
        .update({ plan: null, stripe_subscription_id: null })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
