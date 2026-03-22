import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICES: Record<
  string,
  { amount: number; mode: "payment" | "subscription"; name: string }
> = {
  pdf: { amount: 500, mode: "payment", name: "PDF Export" },
  word: { amount: 500, mode: "payment", name: "Word Export" },
  "cover-letter": { amount: 200, mode: "payment", name: "Cover Letter Generator" },
  roast: { amount: 200, mode: "payment", name: "AI CV Roast" },
  annual: { amount: 8640, mode: "subscription", name: "Annual Plan" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceType } = body;

    if (!priceType || !PRICES[priceType]) {
      return NextResponse.json(
        {
          error: `Invalid price type. Must be one of: ${Object.keys(PRICES).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const price = PRICES[priceType];
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: price.mode,
      success_url: `${origin}/builder?payment=success&product=${priceType}`,
      cancel_url: `${origin}/builder?payment=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            product_data: { name: price.name },
            unit_amount: price.amount,
            ...(price.mode === "subscription" && {
              recurring: { interval: "year" as const },
            }),
          },
        },
      ],
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}
