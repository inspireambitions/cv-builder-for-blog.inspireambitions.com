import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed":
        // Log successful payment
        // In production, update user's plan in database
        console.log("Payment completed:", event.data.object);
        break;
      case "invoice.payment_succeeded":
        console.log("Subscription renewed:", event.data.object);
        break;
      case "customer.subscription.deleted":
        console.log("Subscription cancelled:", event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal webhook error" },
      { status: 500 }
    );
  }
}
