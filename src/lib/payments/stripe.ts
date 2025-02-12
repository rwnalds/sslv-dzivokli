import { redirect } from "next/navigation";
import Stripe from "stripe";
import { getCurrentUser } from "../session";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function createCheckoutSession({ priceId }: { priceId: string }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/pricing`);
  }

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: user.email || undefined,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    client_reference_id: user?.id?.toString(),
    allow_promotion_codes: true,
  });

  redirect(stripeSession.url!);
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
    type: "one_time",
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
  }));
}
